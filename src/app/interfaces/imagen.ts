type ImageType = 'thumbnail' | 'square' | 'medium'

/**
 * @description Urls de las variantes de imagenes
 * Asociada al alrticulo
 */
export interface ImagenCloudProps {
  id: string // id unico
  filename: string // nombre del archivo
  variants: { [Key in ImageType]: ImageType } // objeto de variantes thumball, public, medium, etc
}
