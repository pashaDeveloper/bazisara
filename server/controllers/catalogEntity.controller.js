function createCatalogEntityController(service) {
  return {
    create: async (req, res, next) => {
      try {
        await service.create(req, res);
      } catch (error) {
        next(error);
      }
    },
    getAll: async (req, res, next) => {
      try {
        await service.getAll(req, res);
      } catch (error) {
        next(error);
      }
    },
    getOne: async (req, res, next) => {
      try {
        await service.getOne(req, res);
      } catch (error) {
        next(error);
      }
    },
    update: async (req, res, next) => {
      try {
        await service.update(req, res);
      } catch (error) {
        next(error);
      }
    },
    remove: async (req, res, next) => {
      try {
        await service.remove(req, res);
      } catch (error) {
        next(error);
      }
    },
  };
}

module.exports = createCatalogEntityController;
