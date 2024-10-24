import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { rubro_card } from "../../assets/assets";

const RubroDetailContainer = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const { itemId } = useParams();

    useEffect(() => {
        setLoading(true);

        // Encuentra el producto con el id correspondiente en el array de productos
        const foundProduct = rubro_card.find(p => p.id === itemId);

        if (foundProduct) {
            setProduct(foundProduct);
        } else {
            console.log(`Producto con id ${itemId} no encontrado`);
        }

        setLoading(false);
    }, [itemId]);

    return (
        <div>
            {loading
                ? <h1>Cargando..</h1>
                : <RubroDetail {...product} />
            }
        </div>
    );
}

export default RubroDetailContainer;
