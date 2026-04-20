import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/material'
import {
    ResponsiveContainer,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Legend,
    Bar,
    Rectangle,
    Tooltip,
} from 'recharts'
import { deepPurple } from '@mui/material/colors'

type Anomalia = {
    nombre: string
    pedidoId: string
    numeroPedido: string
    orden: number
}

type AnomaliasGraficoProps = {
    anomalias: Anomalia[]
}

const AnomaliasGrafico = ({ anomalias }: AnomaliasGraficoProps) => {

    const dataGrafica = useMemo(() => {
        const agrupado: Record<string, { count: number; pares: Set<string> }> = {}

        for (const { nombre, numeroPedido, orden } of anomalias) {
            if (!agrupado[nombre]) {
                agrupado[nombre] = { count: 0, pares: new Set() }
            }
            agrupado[nombre].count++
            agrupado[nombre].pares.add(`pedido "${numeroPedido}" de la orden "${orden}"`)
        }

        // Convertir a array y ordenar por cantidad descendente
        const arrayDatos = Object.entries(agrupado).map(([nombre, { count, pares }]) => ({
            nombre,
            value: count,
            pares: Array.from(pares),
        }))

        // Limitar a los 10 primeros
        return arrayDatos.sort((a, b) => b.value - a.value).slice(0, 10)
    }, [anomalias])

    if (dataGrafica.length === 0) {
        return <Typography>No hay anomalías para mostrar.</Typography>
    }

    return (
        <Box
            p={2}
            boxShadow={3}
            borderRadius={2}
            bgcolor="background.paper"
        >
            {/* Gráfico de barras */}
            <Box height={400}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={dataGrafica}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="4 4" />
                        <XAxis type="number" dataKey="value" />
                        <YAxis type="category" dataKey="nombre" fontSize={11} width={150} />
                        <Tooltip
                            formatter={(value: any, name: any, item: any) => {
                                return [`${value} anomalías`, `Artículo: ${item.payload.nombre}`]
                            }}
                            labelFormatter={(label, payload) => {
                                const datos = payload[0]?.payload
                                return `${label} (${datos?.pares.length} pedidos/órdenes)`
                            }}
                        />
                        <Legend />
                        <Bar
                            dataKey="value"
                            name="Cant. Anomalías"
                            fill={deepPurple[300]}
                            activeBar={<Rectangle fill={deepPurple[400]} />}
                            isAnimationActive
                        />
                    </BarChart>
                </ResponsiveContainer>
            </Box>

        </Box>
    )
}

export default AnomaliasGrafico
