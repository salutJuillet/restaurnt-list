import React, { useState, useEffect } from 'react'
import { Roadview, Map, MapMarker, CustomOverlayMap } from 'react-kakao-maps-sdk'
import { ListGroupItem, Row, Col } from 'reactstrap'
import { Link } from 'react-router-dom'
import { Button } from 'reactstrap'

const RestListItem = (props) => {
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [radius, setRadius] = useState('');

    useEffect(() => {
        setLat(props.latitude);
        setLon(props.longitude);
        setRadius(props.radius);
    }, [])

  return (
    <ListGroupItem className="py-4 px-4">
    <Row className="content-box">
        <Col xs="3" className="roadview-box">
            <Roadview
                position={{
                    lat:lat,
                    lng:lon,
                    radius:radius
                }}
                style={{
                    width:'100%',
                    height:"250px",
                    borderRadius:'15px'
                }}
            />
        </Col>
        <Col xs="5">
            <h2>
                {props.title}
                
                <Link to={"edit/" + props.id}>
                    <Button  outline className="edit-btn">수정</Button>
                </Link>
            </h2>
            <p>{props.title_food}</p>
            <p>{props.tel}</p>
            <p>({props.zip}) {props.address}<br /> {props.address_old}</p>
        </Col>
        <Col xs="4">
            <Map
                center={{
                lat:lat,
                lng:lon
                }}
                style={{
                    width:"250px",
                    height:"200px",
                    border:"1px solid #ddd"
                }}
                levle={3}>
                <MapMarker position={{lat:lat, lng:lon}} />
                <CustomOverlayMap position={{lat:lat, lng:lon}}>
                    <div className="label">
                        <span className="marker-title">{props.title}</span>
                    </div>
                </CustomOverlayMap>
            </Map>
        </Col>
    </Row>
    </ListGroupItem>

  )
}

export default RestListItem