import React, { FormEvent, useState } from "react"
import {Button, Form, Icon, Input, InputNumber, Layout, Radio, Typography, Upload} from "antd"
import { FormComponentProps } from "antd/lib/form"
import { UploadChangeParam } from "antd/lib/upload"
import { Viewer } from "../../lib/types"
import { HOST_LISTING } from "../../lib/graphql/mutation/HostListing"
import { HostListing as HostListingData, HostListingVariables} from "../../lib/graphql/mutation/HostListing/__generated__/HostListing"
import { displayErrorMessage, displaySuccessNotification, iconColor } from "../../lib/components"
import { Link, Redirect } from "react-router-dom"
import { ListingType } from "../../lib/graphql/globalTypes"
import { useMutation } from "react-apollo"


interface Props{
    viewer: Viewer
}
const { Content } = Layout

const {Text, Title} = Typography

const { Item } = Form


export const Host = ({viewer, form}: Props & FormComponentProps) =>{
    const [imageLoading, setImageLoading] = useState(false)
    const [imageBase64Value, setImageBase64Value] = useState<string | null>(null)
    const [hostListing, {data, loading}]=useMutation<HostListingData,HostListingVariables>(HOST_LISTING,{
        onCompleted: () =>{
            displaySuccessNotification("You've successfully created your listing!")
        },
        onError: () => {
            displayErrorMessage("Sorry We weren't able to create your listing. Please try again later.")
        }
    })


    const handleImageUpload = (info:UploadChangeParam) => {
        const { file } = info

        if(file.status === "uploading"){
            setImageLoading(true)
            return
        } 

        if(file.status === 'done' && file.originFileObj){
            getBase64Value(
                file.originFileObj,
                imageBase64Value => {
                    setImageBase64Value(imageBase64Value)
                    setImageLoading(false)
                }
            )
        }
    }

    const handleHostListing =(evt: FormEvent)=>{
        evt.preventDefault();

        form.validateFields((err, values) =>{
            if(err){
                displayErrorMessage("Please complete the required form fields!")
                return
            }

            const fullAddress = `${values.address},${values.city},${values.state},${values.postalCode}`

            const input = {
                ...values,
                address: fullAddress,
                image: imageBase64Value,
                price: values.price *100
            }
            delete input.city
            delete input.state
            delete input.postalCode
            
            hostListing ({
                variables:{
                    input
                }
            })
        })
    }

    if(!viewer.id || !viewer.hasWallet){
        return(
            <Content className="host-content">
        <div className="host__form-header">
            <Title level={4} className="host__form-title">You'll have to be signed in and connected with Stripe to host a listing!</Title>
            <Text type="secondary"> We only allow user who've signed in to our application and have connected with Stripe to host new lsitings.
            You can sign in at the <Link to="/login">Login</Link> page and connect with Stripe shortly after.</Text>
        </div>
    </Content>
        )
    }

    if(loading){
        return(
            <Content className="host-content">
        <div className="host__form-header">
            <Title level={3} className="host__form-title">Please wait!</Title>
            <Text type="secondary"> We're creating your listing now.</Text>
        </div>
    </Content>
        )
    }  

    if(data && data.hostListing){
        return(<Redirect to={`/listing/${data.hostListing.id}`}/>)
    }

    const { getFieldDecorator } = form
 
    return (
        <Content className="host-content">
            <Form layout="vertical" onSubmit={handleHostListing}>
                <div className="host__form-header">
                    <Title level={3} className="host__form-title">Hi! Let's get started listing your place.</Title>
                    <Text type="secondary"> In this  form, we'll collect some basic and additional information about your listing</Text>
                </div>

                <Item label="Home Type" >
                    { getFieldDecorator("type", {
                        rules: [{
                            required: true,
                            message: "Please select a home type!"
                        }]
                    })(
                        <Radio.Group>
                        <Radio.Button value={ListingType.APARTMENT}>
                            <Icon type="bank" style={{color: iconColor}} /> <span>Apartment</span>
                        </Radio.Button>
                        <Radio.Button value={ListingType.HOUSE}>
                            <Icon type="home" style={{color: iconColor}} /> <span>House</span>
                        </Radio.Button> 
                    </Radio.Group>
                    )} 
                </Item>
                <Item label="Max Number of Guest">
                    {getFieldDecorator("numOfGuests", {
                            rules: [{
                                required: true,
                                message: "Please enter max number of guests!"
                            }]
                        })(<InputNumber min={1} placeholder="4"/>)}
                </Item>
                <Item label="Title" extra="Max character count of 45">
                    {getFieldDecorator("title", {
                            rules: [{
                                required: true,
                                message: "Please enter a title for your listing"
                            }]
                        })(<Input maxLength={45} placeholder="The iconic and luxurious Bel-Air mansion"/>)}
                </Item>

                <Item label="Description of listing" extra="Max character count of 450">
                    {getFieldDecorator("description", {
                                rules: [{
                                    required: true,
                                    message: "Please enter a description for your listing"
                                }]
                            })(<Input.TextArea rows={3} maxLength={450} placeholder="Modern, clean, and iconic home of the Fresh Prince. Situated in the heart of Bel-Air Los Angeles."/>)}
                </Item>

                <Item label="Address" >
                {getFieldDecorator("address", {
                                rules: [{
                                    required: true,
                                    message: "Please enter an address for your listingi"
                                }]
                            })(<Input placeholder="251 North Bristal Avenue"/>)}
                </Item>

                <Item label="City/Town" >
                {getFieldDecorator("city", {
                                rules: [{
                                    required: true,
                                    message: "Please enter a city(or town) for your listing"
                                }]
                            })(<Input placeholder="Los Angeles"/>)}
                </Item>

                <Item label="State/Province" >
                {getFieldDecorator("state", {
                                rules: [{
                                    required: true,
                                    message: "Please enter a state(or province) for your listing"
                                }]
                            })(<Input placeholder="California"/>)}
                </Item>

                <Item label="Zip/Postal Code" >
                {getFieldDecorator("postalCode", {
                                rules: [{
                                    required: true,
                                    message: "Please zip(or postal) code for your listing"
                                }]
                            })(<Input placeholder="Please enter a zip code for your listing"/>)}
                </Item>


                <Item label="Image" extra="Images have to be under 1MB in size and of type JPG or PNG">
                    <div className="host__form-image-upload">
                    {getFieldDecorator("image", {
                                rules: [{
                                    required: true,
                                    message: "Please provide an image for your listing"
                                }]
                            })(
                        <Upload name="image" listType="picture-card" showUploadList={false} action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                        beforeUpload={beforeImageUpload}
                        onChange={handleImageUpload}>
                            {imageBase64Value ? (
                                <img src={imageBase64Value} alt="Listing"/>
                            ):(
                               <div>
                                   <Icon type={imageLoading ? "loading" : "plus"}/>
                                   <div className="ant-upload-text">Upload</div>
                               </div> 
                            )}
                        </Upload>)}
                    </div>
                </Item>

                <Item label="Price" extra="All prices in $USD/day">
                {getFieldDecorator("price", {
                                rules: [{
                                    required: true,
                                    message: "Please provide a price for your listing"
                                }]
                            })(
                    <InputNumber min={0} placeholder="120"/>)}
                </Item>

                <Item>
                    <Button type="primary" htmlType="submit">Submit</Button>
                </Item>
            </Form>
        </Content>
    )
}

const beforeImageUpload = (file: File) => {
    const fileIsValidImage = file.type === "image/jpeg" || file.type === "image/png"

    const fileIsValidSize = file.size / 1024 / 1024 < 1 

    if(!fileIsValidImage){
        displayErrorMessage("You're only able to upload valid JPG or PNG files!!")
        return false
    }

    if(!fileIsValidSize){
        displayErrorMessage("You're only able to upload valid image file of under 1MB in size!!")
        return false
    }

    return fileIsValidSize && fileIsValidImage
}


const getBase64Value = (img: File | Blob, callback: (imageBase64Value: string) => void) => {
    const reader = new FileReader()
    reader.readAsDataURL(img)
    reader.onload = () => {
        callback(reader.result as string)
    }
}


export const WrappedHost = Form.create<Props & FormComponentProps>({
    name: "host_form"
})(Host)