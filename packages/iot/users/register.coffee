class User.RegisterComponent extends UIComponent
  @register 'User.RegisterComponent'

  onCreated: ->
    super

    @canNew = new ComputedField =>
      !!Meteor.userId()

  events: ->
    super.concat
      'submit form': @onSubmit

  onSubmit: (event) ->
    event.preventDefault()
    inputs =
    	email: $('[name="email"]').val()
    	password: $('[name="password"]').val()
    Accounts.createUser(inputs,
	    (error, documentId) =>
	      if error
	        console.error "Registration error", error
	        alert "Registration error: #{error.reason or error}"
	        return

		    FlowRouter.go 'Device.display',
		      _id: documentId)

 FlowRouter.route '/register',
  name: 'User.register'
  action: (params, queryParams) ->
    BlazeLayout.render 'MainLayoutComponent',
      main: 'User.RegisterComponent'