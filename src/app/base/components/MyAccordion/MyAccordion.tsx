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
  <Accordion disableGutters elevation={1} square {...props} />
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
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .01)',
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
