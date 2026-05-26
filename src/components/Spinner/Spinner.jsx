import './Spinner.css';

function Spinner({ message = 'Generating PDF...' }) {
  return (
    <div className="spinner-overlay">
      <div className="spinner-box">
        <div className="spinner-circle" />
        <p className="spinner-message">{message}</p>
      </div>
    </div>
  );
}

export default Spinner;