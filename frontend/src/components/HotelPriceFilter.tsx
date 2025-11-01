type Props = {
  selectedPrice?: number;
  onChange: (value?: number) => void;
};

const HotelPriceFilter = ({ selectedPrice, onChange }: Props) => {
  return (
    <div>
      <h4 className="text-md font-semibold mb-2">Max Price</h4>
      <select
        className="p-2 border rounded-md w-full"
        value={selectedPrice}
        onChange={(event) =>
          onChange(
            event.target.value ? parseInt(event.target.value) : undefined
          ) // user can select default option
        }
      >
        <option value="">Select Max Price</option>
        {[200,400,600,800,1000].map((price)=>(
            <option value={price}>{price}</option>
        ))
        }
      </select>
    </div>
  );
};

export default HotelPriceFilter;