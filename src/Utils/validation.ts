export const isValidNumber = (value: any): boolean => {
    return !isNaN(value) && Number(value) > 0;
};

export const isValidId = (id: any): boolean => {
    return !isNaN(id) && Number(id) > 0;
};
