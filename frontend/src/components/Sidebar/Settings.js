import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';

// theme options
const options = [
    "Green","Blue",'Dark Mode','High Contrast'
];

/**
 * 
 * @param props onClose function, open state variable 
 * @returns Settings popup containing theme selection
 */
export function ConfirmationDialogRaw(props) {
    const { onClose, value: valueProp, open, ...other } = props;
    const [value, setValue] = React.useState(valueProp);
    const themeOptions = React.useRef(null);
  
    React.useEffect(() => {
      if (!open) {
        setValue(valueProp);
      }
    }, [valueProp, open]);
  
    const handleEntering = () => {
      if (themeOptions.current != null) {
        themeOptions.current.focus();
      }
    };
  
    const handleCancel = () => {
      onClose('cancel');
    };
  
    const handleSave = () => {
      onClose(value);
    };
  
    const handleChange = (event) => {
      setValue(event.target.value);
    };
  
    return (
      <Dialog
        sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
        maxWidth="xs"
        TransitionProps={{ onEntering: handleEntering }}
        open={open}
        {...other}
      >
        <DialogTitle>Select Theme</DialogTitle>
        <DialogContent dividers>
          <RadioGroup
            ref={themeOptions}
            value={value}
            onChange={handleChange}
          >
            {options.map((option) => (
              <FormControlLabel
                value={option}
                key={option}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Ok</Button>
        </DialogActions>
      </Dialog>
    );
  }