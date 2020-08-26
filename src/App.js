import React, {useState, useEffect} from "react";
import "./styles.css";

export default function App() {
  const [netTaxableIncome, setRevenusNetImposable] = useState(0)
  const [impot, setImpot] = useState({total:0,slice:[0,0,0,0,0]})

  function handleChange(event) {
    setRevenusNetImposable(event.target.value)
  }

  useEffect(() => {
    //* Slice = Tranches d'impositions (commence à 0)
    const limSupBySlice = [10064, 25659, 73369, 157806, Infinity]
    const percentTaxeBySlice = [0,0.11,0.30,0.41,0.45]
    let tmpImpot = {total:0,slice:[0,0,0,0,0]}
    let sliceMax = 0
    if (netTaxableIncome > 10064) sliceMax++ //1
    if (netTaxableIncome > 25659) {
      tmpImpot.slice[sliceMax] = (25659-10064)*(11/100)
      sliceMax++ //2
    }
    if (netTaxableIncome > 73369) {
      tmpImpot.slice[sliceMax] = (73369-25659)*(30/100)
      sliceMax++ //3
    }
    if (netTaxableIncome > 157806) {
      tmpImpot.slice[sliceMax] = (157806-73369)*(41/100)
      sliceMax++ //4
    }
    tmpImpot.slice[sliceMax] = (netTaxableIncome - limSupBySlice[sliceMax-1]) * (percentTaxeBySlice[sliceMax]) 
    tmpImpot.total = Math.round(tmpImpot.slice[1] + tmpImpot.slice[2] + tmpImpot.slice[3] + tmpImpot.slice[4])
    setImpot(tmpImpot)
  }, [netTaxableIncome])

  return (
    <div className="App">
      <h1>Calcule impôt sur le revenue net imposable<br/>applicable aux revenus 2020 pour un célibataire sans enfants</h1>
      <form>
        <label>
          Votre revenus net imposable sur une année entière : 
          <input type="number" name="netTaxable" id="netTaxable" value={netTaxableIncome} onChange={handleChange} />
        </label><br/>
      </form>
      <p>Vous devrez payer {impot.total}€ impôts</p>
      <p>Ce qui revient à {impot.total} * 100 / {netTaxableIncome} = {(impot.total * 100 / netTaxableIncome) ? Math.round(impot.total * 100 / netTaxableIncome) : 0}% de vos revenus net imposable</p>
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
          <tr>
            <td>1</td>
            <td>0€ - 10 064€</td>
            <td>0%</td>
            <td>0€</td>
          </tr>
          <tr>
            <td>2</td>
            <td>10 064€ - 25 659€</td>
            <td>11%</td>
            <td>{impot.slice[1]}€</td>
          </tr>
          <tr>
            <td>3</td>
            <td>25 659€ - 73 369€</td>
            <td>30%</td>
            <td>{impot.slice[2]}€</td>
          </tr>
          <tr>
            <td>4</td>
            <td>73 369€ - 157 806€</td>
            <td>41%</td>
            <td>{impot.slice[3]}€</td>
          </tr>
          <tr>
            <td>5</td>
            <td>157 806€ - Infinity</td>
            <td>45%</td>
            <td>{impot.slice[4]}€</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
