import React, {useState, useEffect} from "react";
import ReactTooltip from 'react-tooltip';
import "./styles.css";

export default function App() {
  const [netTaxableIncome, setRevenusNetImposable] = useState(localStorage.getItem("netTaxableIncome") || 0)
  const [married, setMarried] = useState(((localStorage.getItem("married") === "true") ? true : false))
  const [nbChild, setNbChild] = useState(localStorage.getItem("nbChild") || 0)
  const [impot, setImpot] = useState({total:0,slice:[0,0,0,0,0]})

  useEffect(() => {
    console.group("App state")
    console.log(netTaxableIncome)
    console.log(impot)
    console.log(married)
    console.log(nbChild)
    console.groupEnd()

    localStorage.setItem("netTaxableIncome", netTaxableIncome)
    localStorage.setItem("impot", impot)
    localStorage.setItem("married", married)
    localStorage.setItem("nbChild", nbChild)
  }, [netTaxableIncome, married, nbChild, impot])

  useEffect(() => {
    //* Slice = Tranches d'impositions (commence à 0)
    const limSupBySlice = [10064, 25659, 73369, 157806, Infinity]
    const percentTaxeBySlice = [0,0.11,0.30,0.41,0.45]
    let tmpImpot = {total:0,slice:[0,0,0,0,0]}
    let sliceMax = 0
    
    //* Niveau 2 : Quotient familiale 
    let familyQuotient = married ? 2 : 1
    if (nbChild <= 2 && nbChild > 0) familyQuotient += nbChild * 0.5
    if (nbChild > 2) familyQuotient += nbChild - 2
    let netTaxableIncomeAfterFQ = netTaxableIncome / familyQuotient
    
    //* Pour chaque tranches, si elle est "pleine" (revenus au dessus de la limite sup de la tranche), on stocke l'impot de la tranche dans un tableau
    for (let i = 0 ; i < 4 ; i++) {
      if (netTaxableIncomeAfterFQ > limSupBySlice[sliceMax])  {
        const lastLimSupBySlice = (limSupBySlice[sliceMax-1]) ? limSupBySlice[sliceMax-1] : 0 // Évite une erreur à la première itération (limSupBySlice[sliceMax-1] n'existe pas)
        tmpImpot.slice[sliceMax] = (limSupBySlice[sliceMax] - lastLimSupBySlice) * percentTaxeBySlice[sliceMax]
        sliceMax++
      }
    }

    //* On calcule la dernière tranche qui n'est pas remplie
    tmpImpot.slice[sliceMax] = (netTaxableIncomeAfterFQ - limSupBySlice[sliceMax-1]) * (percentTaxeBySlice[sliceMax])

    //* On additionne toutes les tranches et on multiplie par le quotient familiale
    tmpImpot.total = Math.round((tmpImpot.slice[1] + tmpImpot.slice[2] + tmpImpot.slice[3] + tmpImpot.slice[4]) * familyQuotient)

    //* On corrige les taxes par tranches (faussés par le quotient familiale) et on les arrondis
    tmpImpot.slice = tmpImpot.slice.map((slice) => Math.round(slice * familyQuotient ) )

    setImpot(tmpImpot)

  }, [netTaxableIncome, married, nbChild])

  return (
    <main>
      <div className="title">
        <h1>Calcule impôt sur le revenue net imposable <br/><span className="subtitle">applicable aux revenus 2020</span> </h1>
      </div>
      <div className="App">
        <form className="form">
          <label className="label">
            Votre revenus net imposable sur une année : 
            <input 
              className="input inputNumber" 
              type="number" 
              name="netTaxable" 
              id="netTaxable" 
              value={netTaxableIncome} 
              onChange={(event) => setRevenusNetImposable(event.target.value)} 
            />
          </label><br/>
          <label className={`label labelCheckbox ${ married ? "checked" : "" }`}>
            <input 
              className="input inputCheckbox" 
              type="checkbox" 
              name="married" 
              id="married" 
              checked={married} 
              onChange={(event) => {setMarried(event.target.checked);}}
            />
            Pacsé / marié ?
          </label><br/>
          <label className="label">
            Nombre d'enfant :
            <input 
              className="input inputNumber" 
              type="number" 
              name="nbChilds" 
              id="nbChilds" 
              value={nbChild} 
              onChange={(event) => setNbChild(event.target.value)}
            />
          </label>
        </form>
        <div className="result">
          <h2>Votre estimation :</h2>
          <p>L'impôt sur le revenu s'élèvera à : <strong>{impot.total}€</strong></p>
          <p>Ce qui correspond à <strong>{(impot.total * 100 / netTaxableIncome) ? Math.round(impot.total * 100 / netTaxableIncome) : 0}%</strong> de vos revenus</p>
          <p>Il vous restera <strong>{ netTaxableIncome - impot.total}€</strong> "net d'impôts" <span className="help" data-tip="La somme &quot;net d'impôt&quot; est la somme restante après avoir payé l'impôt sur le revenu">?</span></p>
          <h2>Détail par tranche d'imposition : </h2>
          <table>
            <thead>
              <tr>
                <th>Tranches</th>
                <th>Montants des revenus</th>
                <th>Imposition</th>
                <th>Impot payé</th>
              </tr>
            </thead>
            <tbody>
              {/* Peut être optimisé : */}
              <tr>
                <td>1</td>
                <td>0€ - 10.064€</td>
                <td>0%</td>
                <td>0€</td>
              </tr>
              <tr>
                <td>2</td>
                <td>10 064€ - 25.659€</td>
                <td>11%</td>
                <td>{impot.slice[1]}€</td>
              </tr>
              <tr>
                <td>3</td>
                <td>25 659€ - 73.369€</td>
                <td>30%</td>
                <td>{impot.slice[2]}€</td>
              </tr>
              <tr>
                <td>4</td>
                <td>73 369€ - 157.806€</td>
                <td>41%</td>
                <td>{impot.slice[3]}€</td>
              </tr>
              <tr>
                <td>5</td>
                <td>157.806€ - Infinity</td>
                <td>45%</td>
                <td>{impot.slice[4]}€</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <ReactTooltip />
    </main>
  );
}
