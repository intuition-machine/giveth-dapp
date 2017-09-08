import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { feathersClient } from './../../lib/feathersClient'
import loadAndWatchFeatherJSResource from '../../lib/loadAndWatchFeatherJSResource'
import { paramsForServer } from 'feathers-hooks-common'

import Loader from './../Loader'
import GoBackButton from '../GoBackButton'
import BackgroundImageHeader from '../BackgroundImageHeader'
import Avatar from 'react-avatar'
import DonateButton from '../DonateButton'
import ShowTypeDonations from '../ShowTypeDonations'


/**
  Loads and shows a single milestone

  @route params:
    milestoneId (string): id of a milestone
**/

class ViewMilestone extends Component {
  constructor() {
    super()

    this.state = {
      isLoading: true,
      hasError: false,
      isLoadingDonations: true,
      errorLoadingDonations: false,
      donations: []      
    }
  }  

  componentDidMount() {
    const milestoneId = this.props.match.params.milestoneId

    this.setState({ id: milestoneId })

    feathersClient.service('milestones').find({ query: {_id: milestoneId }})
      .then(resp =>
        this.setState(Object.assign({}, resp.data[0], {  
          isLoading: false,
          hasError: false
        })))
      .catch(() =>
        this.setState({ isLoading: false, hasError: true })
      )

    // lazy load donations         
    const query = paramsForServer({ 
      query: { type_id: milestoneId },
      schema: 'includeDonorDetails'
    })  

    new loadAndWatchFeatherJSResource('donations', query, (resp, err) => {
      if(resp){
        this.setState({
          donations: resp.data,
          isLoadingDonations: false,
          errorLoadingDonations: false
        })
      } else {
        this.setState({ isLoadingDonations: false, errorLoadingDonations: true })
      }
    })       

  }

  render() {
    const { history } = this.props

    let { isLoading, 
          id,
          title, 
          description, 
          recipientAddress, 
          reviewerAddress, 
          ownerAddress,
          completionDeadline, 
          image,
          donationsReceived,
          donationsGiven,
          donations,
          isLoadingDonations,
          owner
    } = this.state

    return (
      <div id="view-milestone-view">
        { isLoading && 
          <Loader className="fixed"/>
        }
        
        { !isLoading &&
          <div>
            <BackgroundImageHeader image={image} height={300} >
              <Link to={`/profile/${ owner.address }`}>
                <Avatar size={50} src={owner.avatar} round={true}/>                  
                <p className="small">{owner.name}</p>
              </Link> 
              <h6>Milestone</h6>
              <h1>{title}</h1>
              
              <DonateButton type="milestone" model={{ title: title, _id: id }}/>
            </BackgroundImageHeader>

            <div className="row">
              <div className="col-md-8 m-auto">
                <div>
                  <GoBackButton history={history}/>

                  <p>Milestone</p>

                  <div className="content">
                    <h2>About this Milestone</h2>
                    <div dangerouslySetInnerHTML={{__html: description}}></div>
                  </div>                    

                  <hr/>

                  <p>Reviewer address: {reviewerAddress}</p>
                  <p>Owner address: {ownerAddress}</p>
                  <p>Recipient address: {recipientAddress}</p>
                  <p>Completion deadline: {completionDeadline}</p>
                  <p>Donations received: {donationsReceived}</p>
                  <p>Donations given: {donationsGiven}</p>

                </div>
              </div>
            </div>                

            <div className="row">
              <div className="col-md-8 m-auto">    
                <h4>Donations</h4>        
                <ShowTypeDonations donations={donations} isLoading={isLoadingDonations} />  
              </div>
            </div> 
          </div>                
        }
      </div>
    )
  } 
}

export default ViewMilestone

ViewMilestone.propTypes = {
  history: PropTypes.object.isRequired
}