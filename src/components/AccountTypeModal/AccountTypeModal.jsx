import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

const AccountTypeModal = ({ open, onClose, onSelectAccountType, setShowRegister }) => {

  const handleSelectAccountType = (type) => {
    onSelectAccountType(type);
    setShowRegister(true); 
    onClose(); 
  };

  const userBenefits = [
    "Reservar espacios fácilmente",
    "Historial de reservas",
    "Notificaciones y recordatorios",
  ];

  const ownerBenefits = [
    "Administrar horarios y espacios",
    "Recibir notificaciones de reservas",
    "Control total de disponibilidad",
  ];

  return (
    <Modal open={open} onClose={onClose} style={{ zIndex: 1300 }}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 3,
        }}
      >
        {/* Botón de cierre */}
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

        {/* Título */}
        <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
          Selecciona el tipo de cuenta
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Elige el tipo de cuenta que mejor se adapte a tus necesidades.
        </Typography>

        {/* Opciones */}
        <Box display="flex" justifyContent="space-between" mt={2}>
          {/* Opción Usuario */}
          <Box
            sx={{
              width: '45%',
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              boxShadow: 3,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 6,
              },
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="primary" mb={2} textAlign="center">
              Cuenta Usuario
            </Typography>
            <Box>
              {userBenefits.map((benefit, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  display="flex"
                  alignItems="center"
                  gutterBottom
                >
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  {benefit}
                </Typography>
              ))}
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, borderRadius: 2 }}
              onClick={() => handleSelectAccountType('user')}
            >
              Seleccionar
            </Button>
          </Box>

          {/* Opción Negocio */}
          <Box
            sx={{
              width: '45%',
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              boxShadow: 3,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 6,
              },
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="secondary" mb={2} textAlign="center">
              Cuenta Negocio
            </Typography>
            <Box>
              {ownerBenefits.map((benefit, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  display="flex"
                  alignItems="center"
                  gutterBottom
                >
                  <CheckIcon color="success" sx={{ mr: 1 }} />
                  {benefit}
                </Typography>
              ))}
            </Box>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ mt: 2, borderRadius: 2 }}
              onClick={() => handleSelectAccountType('owner')}
            >
              Seleccionar
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AccountTypeModal;
