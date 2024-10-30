
export function arrayMove<T>(array: T[], fromIndex: number, toIndex: number): T[] {
    const newArray = Array.from(array);
    const [movedItem] = newArray.splice(fromIndex, 1); 
    newArray.splice(toIndex, 0, movedItem); 
    return newArray;
  }
  