const InputField = ({ value, onChange, placeholder, type = 'text', required = false }) => (
    <div className="form-group">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
  
  export default InputField;
  