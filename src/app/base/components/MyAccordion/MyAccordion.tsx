import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
  AccordionSummaryProps,
  styled,
} from '@mui/material'

/**
 * Extencion del componente Accordion con estilos propios
 */
export const MyAccordion = styled((props: AccordionProps) => (
  <Accordion disableGutters square {...props}>
    {props.children}
  </Accordion>
))(({ theme }) => ({
  border: `0.8px solid ${theme.palette.divider}`,
  '&:not(:last-child)': { borderBottom: 0 },
  '&::before': { display: 'none' },
  borderRadius: theme.shape.borderRadius,
}))

/**
 * Extension del componoente AccordionSumary con estilos
 */
export const MyAccordionSummary = styled((props: AccordionSummaryProps) => (
  <AccordionSummary
    expandIcon={<ArrowDownwardIcon sx={{ fontSize: '1.2rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  minHeight: '40px',
  backgroundColor:
    theme.palette.mode === 'dark' ? theme.palette.grey['300'] : theme.palette.grey[50],
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'rotate(90deg)' },
  '& .MuiAccordionSummary-content': { marginLeft: theme.spacing(1) },
}))

/**
 * Extension del componente AccordionDetails con estilos
 */
export const MyAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}))
