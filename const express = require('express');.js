const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const formidable = require('formidable');
const fs = require("fs");
const multer = require('multer')
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const formatDate = (dateString) => 
{
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // months are zero-indexed
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};
"use strict"

const db =  mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'shabnam',
  database: 'client_crm_mishra'
});

const app = express();
app.use(express.json())
app.use(cors());

app.get('/',(re,res)=>
{
	return res.json("from backend");
})

app.get('/login_usr',(re,res)=>
{
	const sql="select * from login_usr";
	db.query(sql,(err,data)=>
	{
		if (err) return res.json(err);
		return res.json(data);
		
	});	
})

app.get('/client',(req,res)=>
{
	const sql="select * from client";
	db.query(sql, (err, data) => 
	{
		if (err) return res.json({Status:"Error"});
				 return  res.json(data);	
	});		
})

//Get client details based on client id
app.get('/client_detail/:id',(req,res)=>
{
	const {id}= req.params;
	console.log("Client ID:"+id)
	const sql='select * from client where CID=?';
	db.query(sql,[id],(err, data) => 
	{
		if (err) return res.json(err);
		return  res.json(data);
		
	});		
})

//
app.get('/resource',(req,res)=>
{
	console.log(req.params)
	const sql="select * from resources r where not exists (select trim(u_id) from login_usr u where trim(r.r_email_id)=trim(u.u_id))";
	db.query(sql, (err, data) => 
	{
		if (err) return res.json(err);
		return  res.json(data);
		
	});		
})
//To get resource name
app.get('/resource_name',(req,res)=>
{
	const sql="select r_name from resources";
	db.query(sql, (err, data) => 
	{
		if (err) return res.json(err);
		return  res.json(data);
		
	});		
})

//To get resource email-id based on name
app.get('/resource_email/:assignee',(req,res)=>
{
	const {assignee} =req.params;
	console.log("assignee:"+assignee)
	const sql='select r_email_id from resources where r_name=?';
	db.query(sql, [assignee],(err, data) => 
	{
		if (err) return res.json(err);
		return  res.json(data);
		
	});		
})
//API to fecth fees details
app.get('/FetchFeesDet/:Case_no',(req,res)=>
{
	const  {Case_no} = req.params;
	 console.log("case_id for fees "+Case_no)
	
	const sql="select * from client_fees where case_id=?";
	db.query(sql, [Case_no],(err, data) => 
	{
		if (err)
		{	
			console.log("Error in fetching fees"+err);
			return res.json(err);
		}
		else
		{
			 
				console.log(data)
				return  res.json(data);

		}
		
	});		
})
//API call to get case details based on customer id
app.get('/CaseDetails/:id',(req,res)=>
{
	const  {id } = req.params;
    console.log("cid"+id)
	const sql='select clnt.name, clnt.address,clnt.email_id,clnt.contact_no1,c.*  from  client clnt,cases c where clnt.CID = c.cust_id and cust_id=?';
	db.query(sql, [id], (err, data) => 
	{
		if (err) return res.json(err);
		return  res.json(data);
		
	});	
	
})
app.get('/maxCaseID',(re,res)=>
{
	const sql="select IFNULL(max(caseid)+1,1) as CaseID from cases";
	db.query(sql,(err,data)=>
	{
		if (err) return res.json(err);
		return res.json(data);
		
	});	
})

app.get('/maxClientID',(re,res)=>
{
	const sql="select IFNULL(max(CID)+1,1) as CID from client";
	db.query(sql,(err,data)=>
	{
		if (err) return res.json(err);
		return res.json(data);
		
	});	
})

app.post('/Addclient', (req, res) => 
{
	console.log(req.body);
	jsondata = req.body;
	cid					= jsondata['cid'];
	const obj=cid
	
	const cust_id=obj.CID
	console.log(cust_id)

    title 				= jsondata['selectedTitle'];
    name 				= jsondata['Name'];
	Gender              = jsondata['selectedGender'];
    DOB 				= jsondata['DOB'];
    address 			= jsondata['Address'];
	address1			= jsondata['Alternate_address'];
	city 				= jsondata['Ccity'];
	state 				= jsondata['CState'];
	email_id 			= jsondata['Email'];
	contact_no1 		= jsondata['Contact1'];
	contact_no2 		= jsondata['Contact2'];
	pincode				= jsondata['pincode'];
	
	// If contact_no2 and alternate is an empty string, set it to null
	const altContactNo = contact_no2 === '' ? null : contact_no2;
	const altAddress   = address1 === '' ? null : contact_no2;
	
	const sql='INSERT INTO CLIENT (title,name,gender,DOB,address,alternate_address,city,state,email_id,contact_no1,contact_no2,pincode) values (?,?,?,?,?,?,?,?,?,?,?,?)';

	db.query(sql, [title,name,Gender,DOB,address,altAddress,city,state,email_id,contact_no1,altContactNo,pincode], (err, data) => 
		{
			if (err) return res.status(500).json({ success: false, message: err.message });
					 return res.json({Status:"Success"});
		}
		
		);
}
);
//Add resource
app.post('/Addresource', (req, res) => 
{
	console.log(req.body);
	jsondata = req.body;

    userID 				= jsondata['Email'];
	Gender              = jsondata['selectedGender'];
    name 				= jsondata['Name'];
    DOB 				= jsondata['DOB'];
    address 			= jsondata['Address'];
	contact_no1			= jsondata['Contact1']
	qualification 		= jsondata['selectedqua'];
	Designation 		= jsondata['selecteddsg'];
	DOJ					= jsondata['DOJ']
	tot_exp 			= jsondata['selectedExp'];
	pwd					= jsondata['uPwd'];
	selectedUser 				= jsondata['Email'];
	

	const sql='INSERT INTO RESOURCES (r_email_id,r_name,r_address,r_gender,r_dob,r_designation,r_joiningDate,r_contactNo,r_experience,r_qualification) values (?,?,?,?,?,?,?,?,?,?)';

	db.query(sql, [userID,name,address,Gender,DOB,Designation,DOJ,contact_no1,tot_exp,qualification], (err, data) => 
		{
			if (err) return console.log(err)
			else
			{
				const u_role ='user';
				if (!selectedUser || !pwd || !u_role) 
				{
					return res.status(400).json({ Status: "Error", Message: "Email and Password are required" });
				}
				const chkUser = "SELECT `u_id` FROM `login_usr` WHERE u_id = ?";
				db.query(chkUser, [selectedUser], (err, result) => {
        
				if (err) 
				{
					return res.status(500).json({ Status: "Error", Message: "Database error while checking user" });
				}

				if (result.length > 0) 
				{
					return res.status(400).json({ Status: "Error", Message: "Email already exists" });
				}
    
				const sqlInsert = "INSERT INTO login_usr (u_id, u_pwd, u_role) VALUES (?, ?, ?)";
				db.query(sqlInsert, [selectedUser, pwd, u_role], (err, result) => 
				{
				if (err) 
				{
					console.error("Database error:", err);
					return res.status(500).json({ Status: "Error", Message: "Error adding user to database" });
				}
				})
  
				// Send confirmation email
				const transporter = nodemailer.createTransport({
					host: "smtp.gmail.com",
					port: 587,
					secure: false,
					requireTLS: true,
					auth: {
					//user: "shabnam.wv@gmail.com", 
					//pass: "wlds huxh fkbi lifr", 
					user: "verheffensystems@gmail.com", 
					pass: "kflc zfcy rhbw pxne", 
					},
					tls: {
					rejectUnauthorized: false
					}
				});
  
				const mailOptions = {
					from: "verheffensystems@gmail.com",
					to: "shabnam.wv@gmail.com",
					subject: "Login Credentials",
					html: `
					<html>
					<body>
						<h2 style="color:green;">Your account has been created successfully!</h2>
						<p> Please use your email ID and below password to login to the system <br></br>
							Password:<strong>${pwd}</strong></p>
					</body>
					</html>
					`,
				};
  
				transporter.sendMail(mailOptions, (err, info) => 
				{	
				if (err) return res.status(500).json({ Status: "Error", Message: "Failed to send email" });
  
				return res.json({ Status: "Success", Message: "User created successfully and email sent!" });
				});
				});
				
			}
		}
		
		);
	

}
);
app.post('/login', (req, res) => 
{
	
  const sql = 'SELECT * FROM login_usr WHERE u_id = ? AND u_pwd = ?';

  db.query(sql, [req.body.email, req.body.password], (err, data) => {
    if (err) return res.json("Error")
		if(data.length > 0)
		{
			console.log(data[0].u_role);
			console.log("Success");
			return res.json({Status:data[0].u_role,ChangePwd:data[0].ChangePwd});
			
		}
		else
		{
			console.log(data);
			return res.json({Status:"Error"})
		}
  });
}

);


//API to prompt user to change pwd when logging in for first time
app.post('/Updatelogin/:email', (req, res) => 
{	
		const {email} = req.params
		console.log("Update login"+email)
		const sql="update login_usr set ChangePwd='N' where u_id=?";

		db.query(sql,[email],(err,data) => 
		{
			db.commit((err) => 
			{
				if (err) {
					//If commit fails, rollback the transaction
					return db.rollback(() => 
					{
						console.error('Error committing transaction: ', err);
					});
				}
				else
				{
					console.log('Update successful, transaction committed.');
					return res.json({Status:"Success"})
				}
		    });
		});
});

	

// Export the upload function
exports.upload = (folderName) => {
  return multer({
    storage: multer-s3({
      require("dotenv").config();
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

// Configure AWS SDK
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,	
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Configure Multer-S3 Storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read", // Make files publicly accessible (optional)
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});

// API Endpoint for Uploading Files to S3
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded!" });
  }
  res.json({
    message: "File uploaded successfully!",
    fileUrl: req.file.location, // S3 File URL
  });
});


// Set up the Express route for handling uploads
app.post("/upload/:folderName", (req, res) => 
{
  const uploadFolder = req.params.folderName;
  
  console.log("in upload");
  console.log("folder:"+uploadFolder);
  const upload_Folder = uploadFolder.split('_');
  //const uploadPath=upload_Folder[0]+"_"+upload_Folder[1];
  var uploadPath='';
  const doc_type=upload_Folder[2];
  
  if(doc_type==='BILL')
  {	
	console.log("in IF")
	 uploadPath='/Invoice/'+upload_Folder[0]+"_"+upload_Folder[1];
  }
  else
  {
	  	console.log("inelse")
	    uploadPath=upload_Folder[0]+"_"+upload_Folder[1];
	
	
  }
  const upload = exports.upload(uploadPath);
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
  const updateSrc=upload_Folder[3]
  console.log(updateSrc);

 
	upload.single("file")(req, res, function (err) 
	{
	    const { file } = req;
		console.log("Filename:"+file.originalname)
		console.log(file.path)
		const parts = uploadFolder.split('_');
		const caseID=parts[1];
		console.log("caseid"+caseID)
		if (err) 
		{
			if (req.fileValidationError) 
			{
				return res.status(400).send(req.fileValidationError);
			}
			//return res.status(500).send("Error uploading file: " + err.message);
			
		}
		
		//check if file already exists
		const sql_check = 'select count(*) as cnt from case_docs where trim(name)=? and caseID=?';
		db.query(sql_check, [file.originalname,caseID], (err, result) => 
		{	
				if (err) {
					return res.status(500).send('Error uploading file');
				}
				else
				{
					console.log(result)
					const count = result[0]['cnt'];
					if (count > 0 )
					{
					console.log("count is > 1")
					const sql_update ='update case_docs set update_datetime=? where name=? and caseID=?';
					db.query(sql_update, [formattedDate,file.originalname,caseID], (err1, result1) => 
					{

						if (err1)
						{
							console.log("In if")
						}
						
						
					});

					}
				else
				{
					console.log("count is 0")
					const query = 'INSERT INTO case_docs (name, path , caseID, document_type,update_datetime,update_source) VALUES (?, ? ,? ,?,? ,?)';
					db.query(query, [file.originalname, file.path,caseID,doc_type,formattedDate,updateSrc], (err, result) => {
					
					});
					
					const query2="update para_legal_reqdocs set document_status='received' where document_name=?";
					db.query(query2, [doc_type], (err, result) => {
					
					});
				}
				
				if (!res.headersSent) {
				res.json({Status:"Success"});
				}
			}
			
		});
		
  });
});


// Export the upload function
exports.upload_template = () => {
  return multer({
    storage: multer.diskStorage({
      destination: async function (req, file, cb) {
        // Create path for the upload folder
        const uploadPath = './Templates';
		
		
        try {
          await fs.promises.mkdir(uploadPath, { recursive: true });
          cb(null, uploadPath);
        } catch (error) {
          cb(error);
        }
      },

      // Add file extensions back (to avoid the extension being removed by multer)
      filename: function (req, file, cb) {
        const filename = `${file.originalname}`;
		
        cb(null, filename);
      },
    }),
  });
};
//

// Set up the Express route for handling uploads
app.post("/uploadTemplates", (req, res) => 
{

  console.log("in upload");
	const updateSrc='user';
  const upload = exports.upload_template();
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
  upload.single("file")(req, res, function (err) 
	{
	    const { file } = req;
		console.log("Filename:"+file.originalname)
		console.log(file.path)
		
		if (err) 
		{
			if (req.fileValidationError) 
			{
				console.log("File Validation failed")
				return res.status(400).send(req.fileValidationError);
			}
			//return res.status(500).send("Error uploading file: " + err.message);
			
		}
		//check if file already exists
		const sql_check = 'select count(*) as cnt from case_Templates where trim(name)=?';
		db.query(sql_check, [file.originalname], (err, result) => 
		{	
				if (err) {
					console.log("Error in uploading file")
					return res.status(500).send('Error uploading file');
				}
				else
				{
					console.log(result)
					const count = result[0]['cnt'];
					if (count > 0 )
					{
					console.log("count is > 1")
					const sql_update ='update case_Templates set update_datetime=? where name=?';
					db.query(sql_update, [formattedDate,file.originalname], (err1, result1) => 
					{

						if (err1)
						{
							console.log("In if")
						}
						
						
					});

					}
				else
				{
					console.log("count is 0")
					const query = 'INSERT INTO case_Templates (name, path ,update_datetime,update_source) VALUES (?, ? ,? ,?)';
					db.query(query, [file.originalname, file.path,formattedDate,updateSrc], (err, result) => {
					
					});

				}
				
				if (!res.headersSent) {
				res.json({Status:"Success"});
				}
			}
			
		})
		
  });
});
// Export the upload function
exports.upload_RefMat = () => {
  return multer({
    storage: multer.diskStorage({
      destination: async function (req, file, cb) {
        // Create path for the upload folder
        const uploadPath = './ReferenceMaterial';
		
		
        try {
          await fs.promises.mkdir(uploadPath, { recursive: true });
          cb(null, uploadPath);
        } catch (error) {
          cb(error);
        }
      },

      // Add file extensions back (to avoid the extension being removed by multer)
      filename: function (req, file, cb) {
        const filename = `${file.originalname}`;
		
        cb(null, filename);
      },
    }),
  });
};
//

// Set up the Express route for handling uploads
app.post("/uploadRefMat", (req, res) => 
{

  console.log("in upload");
  const updateSrc='user';
  const upload = exports.upload_RefMat();
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
  upload.single("file")(req, res, function (err) 
	{
	    const { file } = req;
		console.log("Filename:"+file.originalname)
		console.log(file.path)
		
		if (err) 
		{
			if (req.fileValidationError) 
			{
				console.log("File Validation failed")
				return res.status(400).send(req.fileValidationError);
			}
			//return res.status(500).send("Error uploading file: " + err.message);
			
		}
		//check if file already exists
		const sql_check = 'select count(*) as cnt from case_ref_mat where trim(name)=?';
		db.query(sql_check, [file.originalname], (err, result) => 
		{	
				if (err) {
					console.log("Error in uploading file")
					return res.status(500).send('Error uploading file');
				}
				else
				{
					console.log(result)
					const count = result[0]['cnt'];
					if (count > 0 )
					{
					console.log("count is > 1")
					const sql_update ='update case_ref_mat set update_datetime=? where name=?';
					db.query(sql_update, [formattedDate,file.originalname], (err1, result1) => 
					{

						if (err1)
						{
							console.log("In if")
						}
						
						
					});

					}
				else
				{
					console.log("count is 0")
					const query = 'INSERT INTO case_ref_mat (name, path ,update_datetime,update_source) VALUES (?, ? ,? ,?)';
					db.query(query, [file.originalname, file.path,formattedDate,updateSrc], (err, result) => {
					
					});

				}
				
				if (!res.headersSent) {
				res.json({Status:"Success"});
				}
			}
			
		})
		
  });
});
/////////////////////////
app.post('/Addcase', (req, res) => 
{

	console.log("Add new case");
	console.log(req.body);
	jsondata = req.body;
	
	Cse_ID 		= jsondata['Caseid'];
    const obj	=Cse_ID
	const CseID =obj.CaseID

	case_type 				= jsondata['selectedType'];
	case_assignee           = jsondata['selectedAssignee'];
    case_description 		= jsondata['Description'];
    case_start_date 		= jsondata['Strtdate'];
	case_SLA				= jsondata['SLA'];
	case_status 			= 'New';
	Estimated_hours 		= jsondata['Esthrs'];
	Remaining_hours 		= jsondata['Esthrs'];
	completed_hours 		= 0;
	fees 					= jsondata['Fees'];
	Miscellaneus_fees		= 0;
	GST						= null;
	cust_id					= jsondata['id'];
	case_subStatus			= 'Draft'
	console.log(cust_id)
	console.log(CseID)

		
	const sql='INSERT INTO cases (case_type,case_assignee,case_description,case_start_date,case_SLA,case_status,Estimated_hours,Remaining_hours,completed_hours,fees,Miscellaneus_fees,GST,cust_id,case_subStatus) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
	
	
	db.query(sql, [case_type,case_assignee,case_description,case_start_date,case_SLA,case_status,Estimated_hours,Remaining_hours,completed_hours,fees,Miscellaneus_fees,GST,cust_id,case_subStatus], (err, data) => 
	{
			if (err)
			{				
				return console.log(err)
			}
			else
			{
				if (!res.headersSent) 
				{
					const sql_addFeesdt='INSERT INTO client_fees (fees_date,Total_fees,Amount_paid,Amount_Pending,Misc_fees,cust_id,case_id)VALUES (?,?,?,?,?,?,?)';

					db.query(sql_addFeesdt, [case_start_date,fees,0,fees,0,cust_id,CseID], (err, data) => 
					{
						if (err) return console.log(err)
						if (!res.headersSent) {
							return res.json({Status:"Success"});
						}
					});
					
					const path = "./Case_Documents/"+case_type+"/"+cust_id+"_"+CseID
					console.log(path)
					fs.access(path, (error) => {
 
					if (error) 
					{
						fs.mkdir(path, { recursive: true }, (error) => {
						if (error) 
						{
							console.log(error);
						} 
						else 
						{
							console.log("New Directory created successfully !!");
						}
						});
					} 
					else 
					{
						console.log("Given Directory already exists !!");
					}
				});
				
					return res.json({Status:"Success"});
				}
			}
	});
	
	
});
//
app.post('/UpdateCaseDet/:CaseID', (req, res) => 
{

	console.log("Update case");
	const ID=req.params.CaseID;
	console.log(ID);
	jsondata = req.body;
	
    console.log(jsondata);

	const data =jsondata['data'];

	// Loop through the object
	for (const key in data) 
	{
		if (data.hasOwnProperty(key)) 
		{	  // Ensure it's a direct property of the object
			const value = data[key];
			console.log(`Key: ${key}, Value: ${value}`);
			const sql=`update cases set ${key}=? where Caseid=?`;
			console.log("sql"+sql);
			
			db.query(sql, [`${value}`,ID], (err, data) => 
			{
				db.commit((err) => 
				{
					if (err) 
					{
						// If commit fails, rollback the transaction
						return db.rollback(() => {
						console.error('Error committing transaction: ', err);
			
						});
					}
					else
					{
						if (!res.headersSent) 
						{
							return res.json({Status:"Success"});
						}
					}	
				});
		    });
		}
	}	
});	

//Update client
app.post('/UpdateClientDet/:id', (req, res) => 
{
	console.log("Update client");
	const {id}=req.params;
	console.log(id);
	jsondata = req.body;
  
	// Grab only non-empty values (excluding null, undefined, and empty strings)
	const CID = jsondata['CID']
	const title = jsondata['title']
	const name = jsondata['name']
	const gender = jsondata['gender']
	const address = jsondata['address']
	const alternate_address = jsondata['alternate_address']
	const city = jsondata['city']
	const state = jsondata['state']
	const email_id = jsondata['email_id']
	const contact_no1 = jsondata['contact_no1']
	const contact_no2 = jsondata['contact_no2']
	
	const data = {};
	
	 console.log(contact_no1);
	// Only assign non-empty values to data object
	if (jsondata['CID']) data['CID'] = jsondata['CID'];
	if (jsondata['title']) data['title'] = jsondata['title'];
	if (jsondata['name']) data['name'] = jsondata['name'];
	if (jsondata['gender']) data['gender'] = jsondata['gender'];
	if (jsondata['address']) data['address'] = jsondata['address'];
	if (jsondata['alternate_address']) data['alternate_address'] = jsondata['alternate_address'];
	if (jsondata['city']) data['city'] = jsondata['city'];
	if (jsondata['state']) data['state'] = jsondata['state'];
	if (jsondata['email_id']) data['email_id'] = jsondata['email_id'];
	if (jsondata['contact_no1']) data['contact_no1'] = jsondata['contact_no1'];
	if (jsondata['contact_no2']) data['contact_no2'] = jsondata['contact_no2'];


	for (const key in data) 
	{
		if (data.hasOwnProperty(key)) 
		{  // Ensure it's a direct property of the object
			const value = data[key];
			console.log(`Key: ${key}, Value: ${value}`);
			const sql=`update client set ${key}=? where CID=?`;
			console.log("sql"+sql);
			
			db.query(sql, [`${value}`,id], (err, data) => 
			{

					if (err) 
					{
						//If commit fails, rollback the transaction
						return db.rollback(() => 
						{
							console.error('Error committing transaction: ', err);
						});
					}
			});
			db.commit((err) => 
			{
				if (err) 
				{
				//If commit fails, rollback the transaction
				return db.rollback(() => 
				{
					console.error('Error committing transaction: ', err);
				});
				}

				console.log('Update successful, transaction committed.');
				// Ensure you don't send the response multiple times
				if (!res.headersSent) 
				{
					return res.json({ Status: "Success" });
				}
			});
		}
	}	

});	

//AddFeesDetail
app.post('/AddFeesDetail', (req, res) => 
{
	console.log("In add bill")
	console.log(req.body)
	jsondata=req.body;
	
	CaseID     		= jsondata['CaseID'];
	Amount_Paid     = jsondata['Amount_received'];
	Amount_Pending  = jsondata['Amount_balance']
	TotalFees       = jsondata['TFees'];
	cust_id			= jsondata['id'];
	
	console.log(CaseID)
	console.log(Amount_Paid)
	console.log(Amount_Pending)
	console.log(TotalFees)
	console.log(cust_id)
	const currentDate = new Date();

	const formattedDate = currentDate.toISOString().split('T')[0];
	const indianTime = moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

	const sql_addFeesdt='INSERT INTO client_fees (fees_date,Total_fees,Amount_paid,Amount_Pending,cust_id,case_id)VALUES (?,?,?,?,?,?)';

	db.query(sql_addFeesdt, [formattedDate,TotalFees,Amount_Paid,Amount_Pending,cust_id,CaseID], (err, data) => 
		{
			if (err) {
				console.log(err)
			}
			else
			{
				console.log("success");
			}
		}
		
		);
	
}
);

// API endpoint for getting all documents
app.get("/Casedocuments/:cs_id", (req, res) => {

	const  {cs_id}  =req.params;

   console.log("Case id for docs");
   console.log(cs_id);
   const query = "SELECT * FROM case_docs where caseID=? and document_type<> 'BILL'";
   db.query(query, [cs_id], (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching documents');
    }
	else
	{
				if (!res.headersSent) {
					res.json(results);
				}
	}
  });
});
// API endpoint for getting all bill documents
app.get("/CaseFeesdocuments/:cs_id", (req, res) => {

	const  {cs_id}  =req.params;

   console.log("Case id for Fees docs");
   console.log(cs_id);
   const query = "SELECT caf.invoice_no, cd.id  id,cd.name name ,caf.fees_date fees_date, caf.Amount_paid as Amount_paid,caf.Amount_Pending as Amount_Pending FROM case_docs cd, case_fees_accounting caf where cd.caseID=caf.case_id and cd.caseID=? and cd.document_type = 'BILL'";
   db.query(query, [cs_id], (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching documents');
    }
	else
	{
				if (!res.headersSent) {
					res.json(results);
				}
	}
  });
});
// API endpoint for getting all bill documents for acc. tab
app.get("/CaseFeesdocuments_Acc", (req, res) => 
{
   const query = "select cfa.fees_date,cfa.case_id,cfa.invoice_no,cfa.fee_doc_name,cd.id,c.CID,c.name,cfa.Total_fees,Amount_paid,Amount_Pending,Bal_fee_date from case_fees_accounting cfa,case_docs cd,client c where trim(cd.name)=trim(cfa.fee_doc_name) and cd.document_type='BILL' and c.CID=cfa.cust_id";
   db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching documents');
    }
	else
	{
				if (!res.headersSent) {
					res.json(results);
				}
	}
  });
});
// API endpoint for getting all template documents
app.get("/CaseTemplates", (req, res) => {
	console.log("get template")
   const query = 'SELECT * FROM case_templates';
   db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching documents');
    }
	else
	{
				if (!res.headersSent) {
					res.json(results);
				}
	}
  });
});


// API endpoint for getting all template documents
app.get("/CaseStdyMat", (req, res) => {
	console.log("get material")
   const query = 'SELECT * FROM casestdymat';
   db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching documents');
    }
	else
	{
				if (!res.headersSent) {
					res.json(results);
				}
	}
  });
});

// API endpoint for getting all reference material documents
app.get("/CaseRefMat", (req, res) => {
	console.log("get material")
   const query = 'SELECT * FROM case_ref_mat';
   db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching documents');
    }
	else
	{
				if (!res.headersSent) {
					res.json(results);
				}
	}
  });
});
// API endpoint for downloading a document
app.get('/document_download/:id', (req, res) => {
  
  const { id } = req.params;
  console.log(req.params)
  const query = 'SELECT * FROM case_docs WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('Document not found');
    }
    const filePath = results[0].path;
    res.download(filePath);
  });
});

// API endpoint for downloading fees document
app.get('/document_downloadFeesR/:id', (req, res) => {
  
  const { id } = req.params;
  console.log(req.params)
  const query = 'SELECT * FROM case_docs WHERE invoice_no = ?';
  db.query(query, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('Document not found');
    }
    const filePath = results[0].path;
    res.download(filePath);
  });
});

// API endpoint for downloading a ref study mat doc
app.get('/RefMatdownload/:id', (req, res) => {
  
  const { id } = req.params;
  console.log(req.params)
  const query = 'SELECT * FROM  case_ref_mat WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('Document not found');
    }
    const filePath = results[0].path;
    res.download(filePath);
  });
});
//API call to get case details based on userid
app.get('/case_det_user/:id',(req,res)=>
{
	const  {id} = req.params;
    console.log("userid---"+id)
	const sql ='select cl.*,c.*,r.* from cases c,resources r, client cl where trim(c.case_assignee)=trim(r.r_name) and c.cust_id= cl.CID and trim(r_email_id)=?'
	db.query(sql, [id], (err, data) => 
	{
		if (err) return res.json(err);
		return  res.json(data);
		
	});	
})

//API call to get particuar case id details based on caseID
app.get('/case_det/:id',(req,res)=>
{
	console.log("Case Detail")
	const  {id } = req.params;
    console.log(id)
	const sql ="select DATE_FORMAT(case_start_date, '%Y-%m-%d') as start_date,cl.CID,c.* from cases c, client cl where c.cust_id= cl.CID and c.CaseID=?";
	db.query(sql, [id], (err, data) => 
	{
		if (err) return res.json(err);
		if (!res.headersSent) {
		return  res.json(data);
		}
		
	});	
})

//API to get case status
app.get('/caseStatus', (req, res) => {
  const query = 'SELECT * FROM case_status;';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching status');
    }
    res.json(results);
  });
});
//API to get case sub-status
app.get('/casesubStatus', (req, res) => {
  const query = 'SELECT * FROM case_Substatus;';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching status');
    }
    res.json(results);
  });
});

//API to pull para-legal doc list
app.get('/ParaLegal_docList/:id',(req,res)=>
{

	const {id}=req.params;
	console.log(req.params);
	const sql='select trim(document_name) as document_name from para_legal_reqDocs where trim(document_name) not in (select trim(document_type) as document_name  from case_docs  where  caseID=?)';
	db.query(sql, [id],(err, data) => 
	{
		if (err) return res.json(err);
		else
		{
			if (!res.headersSent) 
			{	
				return  res.json(data);
			}
		}	
	});		
});


//
app.get('/user_detail',(req,res)=>
{
	console.log(req.params)
	const sql="select lgn_u.u_id,r.r_name,lgn_u.u_pwd from resources r,login_usr lgn_u where trim(r_email_id)=trim(u_id)";
	db.query(sql, (err, data) => 
	{
		if (err) return res.json(err);
		return  res.json(data);
		
	});		
});


//Adduser
/*app.post('/Adduser', (req, res) => 
{

	console.log(req.body)
	jsondata = req.body;
	
	user_id 		= jsondata['selectedUser'];
	console.log(user_id);
	user_pwd		=jsondata['pwd'];
	console.log(user_pwd);
	role			='user';
	
	const sql='INSERT INTO login_usr(u_id,u_pwd,u_role) values (?,?,?)';

	db.query(sql, [user_id,user_pwd,role], (err, data) => 
		{
			if (err) return res.json({Status:"error"})
					 return res.json({Status:"Success"});
		}
		
		);
}
);*/

app.post("/Adduser", (req, res) => {
    const { selectedUser, pwd } = req.body;
    console.log(req.body)
    const u_role ='user';
    if (!selectedUser || !pwd || !u_role) {
      return res.status(400).json({ Status: "Error", Message: "Email and Password are required" });
    }
    const chkUser = "SELECT `u_id` FROM `login_usr` WHERE u_id = ?";
    db.query(chkUser, [selectedUser], (err, result) => {
        if (err) {
            return res.status(500).json({ Status: "Error", Message: "Database error while checking user" });
        }

        if (result.length > 0) {
            return res.status(400).json({ Status: "Error", Message: "Email already exists" });
        }
    
    const sqlInsert = "INSERT INTO login_usr (u_id, u_pwd, u_role) VALUES (?, ?, ?)";
    db.query(sqlInsert, [selectedUser, pwd, u_role], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ Status: "Error", Message: "Error adding user to database" });
      }
    })
  
      // Send confirmation email
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          //user: "shabnam.wv@gmail.com", 
          //pass: "wlds huxh fkbi lifr", 
		   user: "verheffensystems@gmail.com", 
           pass: "kflc zfcy rhbw pxne", 
        },
        tls: {
          rejectUnauthorized: false
        }
      });
  
      const mailOptions = {
        from: "verheffensystems@gmail.com",
        to: "shabnam.wv@gmail.com",
        subject: "Login Credentials",
        html: `
        <html>
          <body>
            <h2 style="color:green;">Your account has been created successfully!</h2>
            <p>Your password is: <strong>${pwd}</strong></p>
          </body>
        </html>
      `,
      };
  
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) return res.status(500).json({ Status: "Error", Message: "Failed to send email" });
  
        return res.json({ Status: "Success", Message: "User created successfully and email sent!" });
      });
    });
  });

//Delete user
app.post('/Deleteuser', (req, res) => 
{

    const {userID}=req.body;
	console.log(userID)
	const sql='delete from login_usr where u_id=?';
	console.log("deleted from user")
	db.query(sql, [userID], (err, data) => 
		{
			if (err) return res.json({Status:"error"})
			
			else
			{
				const sql_resrc='delete from resources where r_email_id=?';
				db.query(sql_resrc, [userID], (err, data) => 
				{
					if (err) return res.json({Status:"error"})
					
					else
					{
						console.log("deleted from resources")
						if (!res.headersSent) 
						{
							return res.json({Status:"Success"});
						}
					}
				})
			}
		});
});

//update user
app.post('/Updateuser', (req, res) => 
{
	jsondata = req.body;
	const userID  = jsondata['user_id'];
	const pwd     = jsondata['newPassword'];
	console.log(pwd)
	const sql='update login_usr set u_pwd=? where u_id=?';

	db.query(sql, [pwd,userID], (err, data) => 
		{
			if (err) return res.json({Status:"error"})
			
			else
			{
				if (!res.headersSent) 
				{
					return res.json({Status:"Success"});
				}
			}
		
		});
		
		db.commit((err) => {
		if (err) {
        // If commit fails, rollback the transaction
        return db.rollback(() => {
          console.error('Error committing transaction: ', err);
          db.end();
        });
      }

      console.log('Update successful, transaction committed.');
		    });
});
//API to get latest comment on case
app.get('/case_comments/:case_id',(req,res)=>
{
	console.log("case comments")
	console.log(req.params)
	const {case_id}=req.params;
	//const csID =parseInt(case_id,10)
	const sql="select case_comments,comment_date from case_comments  where case_id=?";
	db.query(sql, [case_id],(err, data) => 
	{
		if (err) return res.json(err);
		return  res.json(data);
		
	});		
});

app.post("/forget-password", (req, res) => {
  const { email } = req.body;
  try {
    console.log("email", email);

    if (!email) {
      return res.status(400).send("Email required");
    }

    const chkUsr = "SELECT * FROM login_usr WHERE u_id = ?";
    db.query(chkUsr, [email], (err, data) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ Status: "Error", Message: "Internal server error" });
      }

      if (data.length === 0) {
        return res.status(404).json({ Status: "Error", Message: "Email not found" });
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      
const sqlUpdate = "UPDATE login_usr SET otp = ?, otp_expiry = NOW() + INTERVAL 10 MINUTE WHERE u_id = ?";

// Debugging: Log OTP and email
console.log("OTP:", otp);
console.log("u_id:", email);

// Execute the database query
db.query(sqlUpdate, [otp, email], (err, result) => {
  if (err) {
    console.error("Database query error:", err); // Log the full error
    return res.status(500).json({ Status: "Error", Message: "Failed to save OTP. Database error." });
  }

  // Debugging: Log the result object
  console.log("Query result:", result);

  // Check if any rows were updated
  if (result.affectedRows > 0) {
    console.log("OTP successfully updated.");
    return res.status(201).json({ Status: "Success", Message: "OTP sent successfully." });
  } else {
    console.error("No user found or no rows updated.");
    return res.status(400).json({ Status: "Error", Message: "User not found or unable to update OTP." });
  }
});


      const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port:587,
            secure:false,
            requireTLS:true,
            auth: {
              user: "verheffensystems@gmail.com", 
				pass: "kflc zfcy rhbw pxne", 
            },
            tls:{
              rejectUnauthorized:false
            }
          });
        
          const mailOptions = {
            from: "nadimkhanpatel@gmail.com",
            to: email,
            subject: "Password Reset OTP",
            text: `This is test otp mail. ${otp}`,
          };
        
          transporter.sendMail(mailOptions, (err, info) => {
            if (err) return res.status(500).json({ Status: "Error", Message: "Failed to send email" });
            return res.json({ Status: "Success", Message: "OTP sent to email" });
          });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error");
  }
});

 // Reset Password
 app.post("/reset-password", (req, res) => {
    const { email, otp, newPassword } = req.body;
  console.log(email)
    console.log(otp)
	  console.log(newPassword)
    const sqlCheckOTP = 'SELECT * FROM login_usr WHERE u_id = ? AND otp = ?';
    db.query(sqlCheckOTP, [email, otp], (err, data) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ Status: "Error", Message: "Internal server error" });
      }
  
      if (data.length === 0) {
        return res.status(400).json({ Status: "Error", Message: "Invalid or expired OTP" });
      }
  
      const sqlUpdatePassword = "UPDATE login_usr SET u_pwd = ?, otp = NULL, otp_expiry = NULL WHERE u_id = ?";
      db.query(sqlUpdatePassword, [newPassword, email], (err, result) => {
	  db.commit((err) => {
		if (err) {
        // If commit fails, rollback the transaction
        return db.rollback(() => {
          console.error('Error committing transaction: ', err);
          db.end();
        });
      }

      console.log('Update successful, transaction committed.');
		    });
  
        return res.json({ Status: "Success", Message: "Password reset successfully" });
      });
    });
  });
  
 //API to send reminder
app.post("/SendReminder", (req, res) => 
{

	jsondata = req.body;
	
	const Reminder = jsondata['Rem'];
	console.log("Reminder", Reminder);
	const email=jsondata['email'];
	const RemType=jsondata['RemType'];

      const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port:587,
            secure:false,
            requireTLS:true,
            auth: {
              user: "verheffensystems@gmail.com", 
				pass: "kflc zfcy rhbw pxne", 
            },
            tls:{
              rejectUnauthorized:false
            }
          });
        
          const mailOptions = {
            from: "verheffensystems@gmail.com",
            to: email,
            subject: `Reminder for ${RemType}`,
            text:  `${Reminder}`
          };
        
          transporter.sendMail(mailOptions, (err, info) => {
            if (err) return res.status(500).json({ Status: "Error", Message: "Failed to send email" });
            return res.json({ Status: "Success", Message: "OTP sent to email" });
          });

  
});  


//update fees
app.post('/Updatefees', (req, res) => 
{
	const{CaseID,Amount_received,Amount_balance,TFees,id,file_name,totalPrice,BalanceDt}=req.body;
	const bal_date= BalanceDt.trim() === "" ? null : BalanceDt;
	 const currentDate = new Date();
	const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');
	console.log("Total_Fees"+TFees)
	console.log("Amount_received"+Amount_received)
	console.log("Amount_balance"+Amount_balance);
	
	//const bal =TFees-Amount_received;
	const sql='update client_fees set Amount_paid=(Amount_paid+?) , Amount_Pending=(Amount_Pending-?) where case_id=?';

	db.query(sql, [Amount_received,Amount_received,CaseID], (err, data) => 
		{
			if (err) return res.json({Status:"error"})
			
		});
		
	db.commit((err) => 
	{
		if (err) {
			// If commit fails, rollback the transaction
			return db.rollback(() => {
			console.error('Error committing transaction: ', err);
        });
      }
	  else
	  {
		  const sql_account ='INSERT INTO case_fees_accounting (fees_date,Total_fees,Amount_paid,Amount_Pending,case_id,cust_id,fee_doc_name,Bal_fee_date)VALUES (?,?,?,?,?,?,?,?)';
		  db.query(sql_account, [formattedDate,totalPrice,Amount_received,Amount_balance,CaseID,id,file_name,bal_date], (err, data) => 
			{
			if (err) 
			{ 
		         console.log(err);
				return res.json({Status:"error"})
			}
				else return res.json({Status:"Success"})
			
			});
	  }
	});
});


app.get("/getCaseDet/:id", (req, res) => {
  const { id } = req.params;
  console.log("Case ID:" + id);
  const sql = "select * from cases where caseId=?";
  db.query(sql, [id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data[0]);
  });
});

//!api to Update User PopUp details 21-02-2025
app.put("/UpdateCaseDetUser/:CaseID", (req, res) => {
  console.log("Update case");
  const ID = req.params.CaseID;
  console.log(ID);
  // console.log(req.body);

  const {
    case_type,
    case_assignee,
    case_description,
    case_start_date,
    case_SLA,
    case_status,
    Estimated_hours,
    Remaining_hours,
    completed_hours,
    fees,
    Miscellaneus_fees,
    GST,
    cust_id,
    case_substatus,
  } = req.body;
  // console.log(req.body);

  // Prepare the SQL update query
  const sql = `
    UPDATE cases
    SET
      case_type = ?,
      case_assignee = ?,
      case_description = ?,
      case_start_date = ?,
      case_SLA = ?,
      case_status = ?,
      Estimated_hours = ?,
      Remaining_hours = ?,
      completed_hours = ?,
      fees = ?,
      Miscellaneus_fees = ?,
      GST = ?,
      cust_id = ?,
      case_substatus = ?
    WHERE CaseId = ?
  `;

  // Begin transaction to ensure atomicity
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Transaction failed to start" });
    }

    // Execute the update query with the data passed in
    db.query(
      sql,
      [
        case_type,
        case_assignee,
        case_description,
        case_start_date,
        case_SLA,
        case_status,
        Estimated_hours,
        Remaining_hours,
        completed_hours,
        fees,
        Miscellaneus_fees,
        GST,
        cust_id,
        case_substatus,
        ID,
      ],
      (err, result) => {
        if (err) {
          return db.rollback(() => {
            console.error("Error in query:", err);
            return res.status(500).json({ error: "Error updating case" });
          });
        }

        // Commit transaction if no error
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error("Error in commit:", err);
              return res
                .status(500)
                .json({ error: "Transaction commit failed" });
            });
          }

          // Send success response
          res.json({ Status: "Success" });
        });
      }
    );
  });
});

//! api to inser expense from user side

app.post("/addExpense", (req, res) => {
  const { date, reason, expense_amount, caseId, CID, r_email_id ,assignee} = req.body;
	console.log("assignee"+assignee);
  // Update default status
  const status = "Pending";

  // SQL query to insert a new expense record
  const query = `
    INSERT INTO expenses (date, reason, expense_amount, caseId, CID, r_email_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // Execute the query with the provided data
  db.query(
    query,
    [date, reason, expense_amount, caseId, CID, r_email_id, status],
    (err, result) => {
      if (err) {
        console.error("Error inserting expense:", err);
        res.json({Status:"Error"});
      }
	else
	{
		const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          //user: "shabnam.wv@gmail.com", 
          //pass: "wlds huxh fkbi lifr", 
		   user: "verheffensystems@gmail.com", 
           pass: "kflc zfcy rhbw pxne", 
        },
        tls: {
          rejectUnauthorized: false
        }
      });
  
      const mailOptions = {
        from: "verheffensystems@gmail.com",
        //to: "shabnam.wv@gmail.com",
		to: r_email_id,
        subject: "Expense Report Submission",
        html: `
        <html>
          <body>
            <h3 style="color:green;">Please find details of Expense Report submitted by you</h3>
            <table style="border: 2px solid black; border-collapse: collapse; width: auto;">
				<tr style="border: 1px solid black;">
				 <th style="border: 1px solid black; padding: 8px;">Case ID</th>
				 <th style="border: 1px solid black; padding: 8px;">Client ID</th>
				 <th style="border: 1px solid black; padding: 8px;">Date</th>
				 <th style="border: 1px solid black; padding: 8px;">Amount</th>
				 <th style="border: 1px solid black; padding: 8px;">Details</th> 
				 <th style="border: 1px solid black; padding: 8px;">Status</th>
				</tr>
				
				<tr style="border: 1px solid black;">
				 <td style="border: 1px solid black; padding: 8px;">${caseId}</td>
				 <td style="border: 1px solid black; padding: 8px;">${CID}</td>
				 <td style="border: 1px solid black; padding: 8px;">${date}</td>
				 <td style="border: 1px solid black; padding: 8px;">₹ ${expense_amount}</td>
				 <td style="border: 1px solid black; padding: 8px;">${reason}</td> 
				 <td style="border: 1px solid black; padding: 8px;">${status}</td>
				</tr>
				
			</table>
          </body>
        </html>
      `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) return res.status(500).json({ Status: "Error", Message: "Failed to send email" });
  
        return res.json({ Status: "Success", Message: "User created successfully and email sent!" });
      });

	}
	}
  );
  
 
});

//! Suntia Api's
app.get("/getcase_det_user", (req, res) => {
  const { status } = req.query;

  let sql = "SELECT * FROM cases";
  let params = [];

  if (status) {
    sql += " WHERE case_status = ?";
    params.push(status);
  }

  db.query(sql, params, (err, data) => {
    if (err) {
      console.error("Error fetching cases:", err);
      return res.status(500).json({ error: "Database error" });
    }
    return res.json(data);
  });	
});

//API to get all pending expense reports for admin to approve
app.get('/expense_detail', (req, res) => {
	
	const sql="select e.id,e.date,e.reason,e.expense_amount,e.caseId,e.CID,r.r_name,r.r_email_id from expenses e,resources r where trim(r.r_email_id)=trim(e.r_email_id) and trim(e.status)='Pending'";
	db.query(sql, (err, data) => 
	{
		if (err) return res.json({Status:"Error"});
				 return  res.json(data);	
	});	

});

//API to update Misc fees if expense is approved
app.post('/AcceptExpense',(req,res) => {
	
	const {caseId,r_email_id,expense_amount,id,CID,date,reason} = req.body;
	const status = "Approved";

	try
	{
	//Query1
	db.query('update cases set Miscellaneus_fees=(Miscellaneus_fees+?) where CaseId=?', [expense_amount,caseId]);
	
	//Query2
	db.query("update expenses set status = 'Completed' where id=?", [id]);
	
	//Query3
	db.query('update client_fees set Misc_fees=(Misc_fees+?) where case_id=?', [expense_amount,caseId]);

	// If all queries are successful, commit the transaction
    db.commit();
	
	
		//send email if expense is approved
		const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          //user: "shabnam.wv@gmail.com", 
          //pass: "wlds huxh fkbi lifr", 
		   user: "verheffensystems@gmail.com", 
           pass: "kflc zfcy rhbw pxne", 
        },
        tls: {
          rejectUnauthorized: false
        }
      });
		
		const mailOptions = {
        from: "verheffensystems@gmail.com",
        //to: "shabnam.wv@gmail.com",
		to: r_email_id,
        subject: "Expense Report Approved",
        html: `
        <html>
          <body>
            <h3 style="color:green;">Please find details of Expense Report submitted by you</h3>
            <table style="border: 2px solid black; border-collapse: collapse; width: auto;">
				<tr style="border: 1px solid black;">
				 <th style="border: 1px solid black; padding: 8px;">Case ID</th>
				 <th style="border: 1px solid black; padding: 8px;">Client ID</th>
				 <th style="border: 1px solid black; padding: 8px;">Date</th>
				 <th style="border: 1px solid black; padding: 8px;">Amount</th>
				 <th style="border: 1px solid black; padding: 8px;">Details</th> 
				 <th style="border: 1px solid black; padding: 8px;">Status</th>
				</tr>
				
				<tr style="border: 1px solid black;">
				 <td style="border: 1px solid black; padding: 8px;">${caseId}</td>
				 <td style="border: 1px solid black; padding: 8px;">${CID}</td>
				 <td style="border: 1px solid black; padding: 8px;">${formatDate(date)}</td>
				 <td style="border: 1px solid black; padding: 8px;">₹ ${expense_amount}</td>
				 <td style="border: 1px solid black; padding: 8px;">${reason}</td> 
				 <td style="border: 1px solid black; padding: 8px;">${status}</td>
				</tr>
				
			</table>
          </body>
        </html>
      `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) return res.status(500).json({ Status: "Error", Message: "Failed to send email" });
  
        return res.json({Status:"Success"})
      });
	//
	}catch(err)
	{
	    console.log('Error in Commiting Transaction!!');	
		return res.json({Status:"Error"})
	}
	finally
	{

	}

});

//API to update Misc fees if expense is rejected
app.post('/RejectExpense',(req,res) => {
	
	const {caseId,r_email_id,expense_amount,id,CID,reason,date} = req.body;
	console.log("In expense reject");
	console.log(id)
	const status = "Rejected";
	const sql_update = "update expenses set status = 'Rejected' where id=?";
	db.query(sql_update, [id], (err1, result1) => 
	{

		db.commit((err1) => {
		if (err1) 
		{
			// If commit fails, rollback the transaction
			return db.rollback(() => 
			{
				console.error('Error committing transaction: ', err);
				db.end();
			});
		}
		else
		{	
			//send email if rejected
			
		const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          //user: "shabnam.wv@gmail.com", 
          //pass: "wlds huxh fkbi lifr", 
		   user: "verheffensystems@gmail.com", 
           pass: "kflc zfcy rhbw pxne", 
        },
        tls: {
          rejectUnauthorized: false
        }
      });
	
      const mailOptions = {
        from: "verheffensystems@gmail.com",
        //to: "shabnam.wv@gmail.com",
		to: r_email_id,
        subject: "Expense Report Rejected",
        html: `
        <html>
          <body>
            <h3 style="color:green;">Please find details of Expense Report submitted by you</h3>
            <table style="border: 2px solid black; border-collapse: collapse; width: auto;">
				<tr style="border: 1px solid black;">
				 <th style="border: 1px solid black; padding: 8px;">Case ID</th>
				 <th style="border: 1px solid black; padding: 8px;">Client ID</th>
				 <th style="border: 1px solid black; padding: 8px;">Date</th>
				 <th style="border: 1px solid black; padding: 8px;">Amount</th>
				 <th style="border: 1px solid black; padding: 8px;">Details</th> 
				 <th style="border: 1px solid black; padding: 8px;">Status</th>
				</tr>
				
				<tr style="border: 1px solid black;">
				 <td style="border: 1px solid black; padding: 8px;">${caseId}</td>
				 <td style="border: 1px solid black; padding: 8px;">${CID}</td>
				 <td style="border: 1px solid black; padding: 8px;">${formatDate(date)}</td>
				 <td style="border: 1px solid black; padding: 8px;">₹ ${expense_amount}</td>
				 <td style="border: 1px solid black; padding: 8px;">${reason}</td> 
				 <td style="border: 1px solid black; padding: 8px;">${status}</td>
				</tr>
				
			</table>
          </body>
        </html>
      `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) return res.status(500).json({ Status: "Error", Message: "Failed to send email" });
  
        return res.json({Status:"Success"})
      });
	  ///		
		}
	});

});
});

//API to change password
app.post('/ChangePwd',(req,res) => {

 const {email,password,newpassword,cpassword} = req.body;
 console.log("In change password")
 console.log(email)
 console.log(password)
 console.log(newpassword)
 console.log(cpassword)
 
 if(newpassword !== cpassword)
 {
	 return res.json({Status:"Error"})
	 console.log("new and confirm new not matching");
 }
 else if(newpassword === cpassword)
 {
	 const sql_update= 'update login_usr set u_pwd=? where u_id=? and u_pwd=?';
	 db.query(sql_update, [newpassword,email,password], (err1, result1) => 
	{

		db.commit((err1) => {
		if (err1) 
		{
			// If commit fails, rollback the transaction
			return db.rollback(() => 
			{
				console.error('Error committing transaction: ', err);
				db.end();
			});
		}
		else
		{	
			return res.json({Status:"Success"})
			console.log('Update successful, transaction committed.');			
		}
		});

	});
 }

}); 

//API to pull case status data for home pageX
app.get('/getCaseData',(req,res)=> {
	
 const sql='select case_status,count(*) as cnt from cases group by case_status';	
	
 db.query(sql, (err1, result1) => 
	{

		if(err1)
		{
			return res.json({Status:"Error"})
		}
		else
		{
			return res.json(result1);
		}

	});
	
});

//! Get resources By id
app.get("/getResources/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM resources WHERE r_email_id =?";
  db.query(sql, [id], (err, data) => {
    if (err) {
      console.error("Error fetching resources:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (data.length > 0) {
      const resource = data[0];
	  // Check if the profileImage exists
      if (resource.profileImage) {
        const imageUrl = `${req.protocol}://${req.get(
          "host"
        )}/profile_images/${path.basename(resource.profileImage)}`;
        resource.profileImageUrl = imageUrl;
      }

      return res.json(resource);
    } else {
      return res.status(404).json({ error: "Resource not found" });
    }
	});
});


//first graph api
app.get("/api/case_types", (req, res) => {
    db.query("SELECT DISTINCT case_type FROM cases", (err, results) => {
        if (err) {
            console.error("❌ Error fetching case types:", err);
            return res.status(500).json({ error: "Database query failed" });
        }
        res.json({ caseTypes: results.map(row => row.case_type) });
    });
});

//API for first bar graph on home page
app.get("/api/case_status_counts", (req, res) => {
	let { case_type, date_filter } = req.query;
  
	let sql = `
	  SELECT 
		case_type,
		SUM(CASE WHEN case_status = 'New' THEN 1 ELSE 0 END) AS new_cases,
		SUM(CASE WHEN case_status = 'InProgress' THEN 1 ELSE 0 END) AS inprogress_cases,
		SUM(CASE WHEN case_status = 'Blocked' THEN 1 ELSE 0 END) AS blocked_cases,
		SUM(CASE WHEN case_status = 'Closed' THEN 1 ELSE 0 END) AS closed_cases
	  FROM cases
	  WHERE 1=1
	`;
  
	let values = [];
  
	if (case_type) {
	  sql += " AND case_type = ?";
	  values.push(case_type);
	}
  
	
	// Handle different date filters
    if (date_filter) {
        if (date_filter.match(/^\d{4}-\d{2}$/)) {
            // Format: YYYY-MM (e.g., "2024-01" for January 2024)
            sql += " AND DATE_FORMAT(case_start_date, '%Y-%m') = ?";
            values.push(date_filter);
        } else {
            switch (date_filter) {
                case "this_week":
                    sql += " AND YEARWEEK(case_start_date, 1) = YEARWEEK(CURDATE(), 1)";
                    break;
                case "previous_week":
                    sql += " AND YEARWEEK(case_start_date, 1) = YEARWEEK(CURDATE(), 1) - 1";
                    break;
                case "this_month":
                    sql += " AND YEAR(case_start_date) = YEAR(CURDATE()) AND MONTH(case_start_date) = MONTH(CURDATE())";
                    break;
                case "previous_month":
                    sql += " AND YEAR(case_start_date) = YEAR(CURDATE()) AND MONTH(case_start_date) = MONTH(CURDATE()) - 1";
                    break;
                case "previous_year":
                    sql += " AND YEAR(case_start_date) = YEAR(CURDATE()) - 1";
                    break;
                default:
                    return res.status(400).json({ error: "Invalid date_filter value" });
            }
        }
    }
	sql += " GROUP BY case_type";
  
	db.query(sql, values, (err, results) => {
	  if (err) {
		console.error("Error fetching cases:", err);
		return res.status(500).json({ error: "Database error" });
	  }
	  res.json(results);
	});
  });


//API endpoint for getting all fees details
app.get("/getFeesData", (req, res) => {

   const query = 'SELECT c.name,cfa.* FROM case_fees_accounting cfa , client c where c.CID=cfa.cust_id order by invoice_no';
   db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching documents');
    }
	else
	{
				if (!res.headersSent) {
					res.json(results);
				}
	}
  });
});

//API to get next Invoice no for accounting table
app.get('/maxInvoiceNo',(re,res)=>
{
	const sql="select IFNULL(max(invoice_no)+1,1) as InvoiceNo from case_fees_accounting";
	db.query(sql,(err,data)=>
	{
		if (err) return res.json(err);
		return res.json(data);
		
	});	
})

//API to add fees details in AddAccountngData
/*app.post('/AddAccountngData', (req, res) => 
{
	console.log(req.body);
	jsondata = req.body;
	cid					= jsondata['cid'];
	const obj=cid
	
	const cust_id=obj.CID
	console.log(cust_id)

    title 				= jsondata['selectedTitle'];
    name 				= jsondata['Name'];
	Gender              = jsondata['selectedGender'];
    DOB 				= jsondata['DOB'];
    address 			= jsondata['Address'];
	address1			= jsondata['Alternate_address'];
	city 				= jsondata['Ccity'];
	state 				= jsondata['CState'];
	email_id 			= jsondata['Email'];
	contact_no1 		= jsondata['Contact1'];
	contact_no2 		= jsondata['Contact2'];
	pincode				= jsondata['pincode'];
	
	// If contact_no2 and alternate is an empty string, set it to null
	const altContactNo = contact_no2 === '' ? null : contact_no2;
	const altAddress   = address1 === '' ? null : contact_no2;
	
	const sql='INSERT INTO CLIENT (title,name,gender,DOB,address,alternate_address,city,state,email_id,contact_no1,contact_no2,pincode) values (?,?,?,?,?,?,?,?,?,?,?,?)';

	db.query(sql, [title,name,Gender,DOB,address,altAddress,city,state,email_id,contact_no1,altContactNo,pincode], (err, data) => 
		{
			if (err) return res.status(500).json({ success: false, message: err.message });
					 return res.json({Status:"Success"});
		}
		
		);
}
);*/
//API endpoint for getting all fees details
app.post('/searchClient', (req, res) => {
	console.log("API called")
	console.log(req.body);
	jsondata = req.body;
	contactNumber					= jsondata['contactNumber'];
	//const {contactNumber}  = req.body;
   console.log("---"+contactNumber)
   const query = 'SELECT * FROM client c ,cases ca where c.CID=ca.cust_id and c.contact_no1=?';
   db.query(query,[contactNumber], (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching documents');
    }
	else
	{
				if (!res.headersSent) {
					res.json(results);
				}
	}
  });
});

app.listen(3000,()=>
{
	console.log("Listen");

})
