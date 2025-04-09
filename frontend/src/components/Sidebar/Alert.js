import { Document, Page } from 'react-pdf';
import { HelpBox } from '../styles/DashboardComponents.styled';
import React, { useEffect, useRef, useState, useMemo } from "react";
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';



/**
 * 
 * @param props onClose function, open state variable 
 * @returns Alert popup
 */
export function AlertBox(props){
  console.log("Alert button");
    const { onClose, value: valueProp, open, ...other } = props;

      const handleClose = () => {
        onClose('i');
      };

    return (
          <HelpBox
            onClose={handleClose}
            open={open}
            PaperProps={{
                style: {
                  height: '40vh',
                  width: '45vw'
                },
              }}
          >
            <DialogTitle sx={{ m: 0, p: 2 , textAlign:'center',fontSize:'1em',fontFamily:'Palanquin Dark'}}>
             Alerts
            </DialogTitle>
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent>
           <div style={{textAlign: 'center'}}>
              No alerts to show.
           </div>
            </DialogContent>
            <DialogActions>
            </DialogActions>
          </HelpBox>
      )

};