class Device.DisplayComponent extends UIComponent
  @register 'Device.DisplayComponent'

  onCreated: ->
    super

    @currentDeviceUuid = new ComputedField =>
      FlowRouter.getParam 'uuid'

    @device = new ComputedField =>
      Device.documents.findOne
        uuid: @currentDeviceUuid()

    @autorun (computation) =>
      deviceUuid = @currentDeviceUuid()
      return unless deviceUuid

      @subscribe 'Device.one', deviceUuid

      @subscribe 'Data.points', deviceUuid

      # @subscribe 'Data.events', deviceUuid

    @autorun (computation) =>
      return unless @subscriptionsReady()

      device = Device.documents.findOne
        uuid: @currentDeviceUuid()
      ,
        fields:
          title: 1

  device: ->
    @device()

  thing: ->
    device = @device()
    device.thing

  # TODO: FIX THIS.
  # eventLog: ->
  #   Events.documents.find
  #     'device._id': @device()?._id
  #   ,
  #     'sort':
  #       'body.timestamp': -1
  
  datapoints: ->
    Data.documents.find
      'device._id': @device()?._id

  events: ->
    super.concat
      'click .remove': @remove
      'click .command': (e) ->
        e.preventDefault()
        console.log "called."
        type = e.currentTarget.dataset.call
        options = e.currentTarget.dataset.options?
        Meteor.call 'Device.sendCommand',
          @currentDeviceUuid(),
          type,
          options,
        ,
          (error, documentId) =>
            if error
              console.error "New deviceerror", error
              alert "New deviceerror: #{error.reason or error}"


  notFound: ->
    @subscriptionsReady() and not @device()

  remove: ->
    device = @device()
    if window.confirm("Are you sure you want to delete this device?")
      Meteor.call 'Device.remove',
        @currentDeviceUuid(),
      ,
        (error, documentId) =>
          if error
            console.error "New deviceerror", error
            alert "New deviceerror: #{error.reason or error}"
          else
            Bert.alert 'Device deleted.', 'success', 'growl-top-right'
            FlowRouter.go 'Dashboard'