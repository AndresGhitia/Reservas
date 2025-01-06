import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

const AccountTypeModal = ({ open, onClose, onSelectAccountType, setShowRegister, onSwitchToLogin }) => {

  const handleSelectAccountType = (type) => {
    onSelectAccountType(type);
    setShowRegister(true); 
    onClose(); 
  };

  return (
    <Modal open={open} onClose={onClose} style={{ zIndex: 1300 }}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >

           {/* Botón de cierre en la esquina superior derecha */}
           <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'grey.500',
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" component="h2" gutterBottom>
          ¿Qué tipo de cuenta deseas crear?
        </Typography>
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSelectAccountType('user')}

          >
            Cuenta Usuario
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleSelectAccountType('owner')}
          >
            Cuenta Negocio
          </Button>
          
        </Box>
      </Box>
    </Modal>
  );
};

export default AccountTypeModal;
