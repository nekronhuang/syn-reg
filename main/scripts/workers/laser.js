var edge = require('edge'),
    printer = edge.func(function() {/*
    #r "System.Drawing.dll"
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections;
using System.IO;
using System.Drawing;
using System.Drawing.Printing;


        public class StartUp
        {
            private dynamic data;
            public Dictionary<string, List<string>> recommendedData = new Dictionary<string, List<string>>();
            private string[] indexArr = new string[] { "A", "B", "C", "D", "E", "F" };
            private string[] indexArrContent = new string[] {"3D打印与增材制造设备 / AM and 3D Printing Machine","原型制造与产品开发 / Prototyping and Product Development",
                "软件系统 / Software","3D扫描与数字化模块 / 3D Scanning and Metrology","3D打印耗材 / Materials","3D打印部件与其他服务 / 3D Parts and Aftermarket"};
            private int paperWidth, paperHeight;
            private Dictionary<string, string[]> exhibitorsDetail;
            private const int INDEX_EXHIBITOR_DETAIL_ID = 0;
            private const int INDEX_EXHIBITOR_DETAIL_LOCATION = 1;
            private const int INDEX_EXHIBITOR_DETAIL_NAME_CHINESE = 2;
            private const int INDEX_EXHIBITOR_DETAIL_NAME_ENGLISH = 3;
            private Random random = new Random();
            private float itemHeight = 0, tempItemHeight = 0, tempStartX = 0, tempStartY = 0, tempDeltaHeight = 0;
            private string tempLocation, tempNameChinese, tempNameEnglish;
            private RectangleF tempNameChineseRectF, tempNameEnglishRectF, tempLocationRectF;
            private SizeF tempNameChineseSizeF, tempNameEnglishSizeF, tempLocationSizeF;
            private int tempIndex;
            private string id = "1111";

            public async Task<object> Invoke(dynamic data)
            {
                string result = "";
                recommendedData = new Dictionary<string, List<string>>();
                this.data = data;
                if (!Directory.Exists(@".\data"))
                {
                    Directory.CreateDirectory(@".\data");
                }
                //if (File.Exists(@".\data\" + id + ".txt"))
                if (File.Exists(@".\data\" + data.id + ".txt"))
                {
                    //result = generateLists(@".\data\" + id + ".txt");
                    result = generateLists(@".\data\" + data.id + ".txt");
                }
                else
                {
                    result = generateLists();
                }
                Console.WriteLine(result);
                initExhibitorsDetail();
                PrintDocument guidePrintDocument = new PrintDocument();
                guidePrintDocument.PrinterSettings.PrinterName = data.PrinterName;
                //guidePrintDocument.PrinterSettings.PrinterName = "\\\\SYNORME\\Canon LBP3010/LBP3018/LBP3050";
                //guidePrintDocument.PrinterSettings.PrinterName = "\\\\SYNORME\\Samsung M262x 282x Series";
                guidePrintDocument.DefaultPageSettings.Landscape = true;
                foreach (PaperSize ps in guidePrintDocument.PrinterSettings.PaperSizes)
                {
                    if (ps.PaperName.Equals("A4"))
                    {
                        guidePrintDocument.DefaultPageSettings.PaperSize = ps;
                        paperHeight = ps.Height;
                        paperWidth = ps.Width;
                        break;
                    }
                }
                guidePrintDocument.PrintPage += print_guide;
                guidePrintDocument.Print();
                return result;
            }

            /// <summary>
            /// 打印导览图
            /// </summary>
            /// <param name="sender"></param>
            /// <param name="e"></param>
            private void print_guide(object sender, PrintPageEventArgs e)
            {
                Console.WriteLine("print start");
                Graphics g = e.Graphics;
                float originX = paperHeight / 2f + 20;
                float originY = 66;
                float currentX = originX;
                float currentY = originY;
                drawId(g, data.id);
                //drawId(g, id);
                currentY += drawFootnote(g, currentX, currentY);
                //foreach (KeyValuePair<string, List<string>> pair in recommendedData)
                //{
                //    string str = pair.Key;
                //    if (recommendedData.ContainsKey(str))
                //    {
                //        List<string> list = recommendedData[str];
                //        int index = 0;
                //        for(int i = 0; i < indexArr.Length; i++) {
                //            if(indexArr[i] == str) {
                //                index = i;
                //                break;
                //            }
                //        }
                //        currentY += drawH1(g, currentX, currentY, indexArrContent[index]);
                //        for (int j = 0; j < list.Count; j++)
                //        {
                //            currentY += drawItem(g, currentX, currentY, j, list);
                //        }
                //    }
                //}
                for (int i = 0; i < indexArr.Length; i++)
                {
                    string str = indexArr[i];
                    if (recommendedData.ContainsKey(str))
                    {
                        List<string> list = recommendedData[str];
                        currentY += drawH1(g, currentX, currentY, indexArrContent[i]);
                        for (int j = 0; j < list.Count; j++)
                        {
                            currentY += drawItem(g, currentX, currentY, j, list);
                        }
                    }
                }
                Console.WriteLine("print finish");
            }

            public void drawId(Graphics g, string content)
            {
                Font font = new Font("微软雅黑", 9, FontStyle.Regular);
                Brush brush = new SolidBrush(Color.FromArgb(255, 0, 0, 0));
                StringFormat stringFormat = new StringFormat { Alignment = StringAlignment.Near };
                SizeF sizeF = g.MeasureString(content, font);
                RectangleF rect = new RectangleF(new PointF(paperHeight - 60 - sizeF.Width, paperWidth - 60 - sizeF.Height), sizeF);
                g.DrawString(content, font, brush, rect, stringFormat);
            }

            public float drawFootnote(Graphics g, float startX, float startY)
            {
                string content = "注：*为重点推荐展商。\r\nNote : * are strongly recommended exhibitors.";
                Font font = new Font("微软雅黑", 9, FontStyle.Italic);
                Brush brush = new SolidBrush(Color.FromArgb(255, 0, 0, 0));
                StringFormat stringFormat = new StringFormat { Alignment = StringAlignment.Near };
                SizeF sizeF = g.MeasureString(content, font);
                RectangleF rectF = new RectangleF(new PointF(startX, startY), sizeF);
                g.DrawString(content, font, brush, rectF, stringFormat);
                return rectF.Height + 8;
            }

            public float drawH1(Graphics g, float startX, float startY, string content)
            {
                //大类标题
                //大类下的水平线
                Font font = new Font("微软雅黑", 12, FontStyle.Regular);
                Brush brush = new SolidBrush(Color.FromArgb(255, 0, 0, 0));
                StringFormat stringFormat = new StringFormat { Alignment = StringAlignment.Near };
                SizeF sizeF = g.MeasureString(content, font);
                RectangleF rect = new RectangleF(new PointF(startX, startY), new SizeF(paperHeight / 2f -  60, sizeF.Height));
                g.DrawString(content, font, brush, rect, stringFormat);
                g.DrawLine(new Pen(brush, 2), new PointF(startX, startY + sizeF.Height + 2), new PointF(startX + paperHeight / 2f - 70, startY + sizeF.Height + 2));
                return sizeF.Height + 6;
            }

            public float drawItem(Graphics g, float startX, float startY, int index, List<string> list)
            {
                //展区位置
                //展区位置右边的竖直线
                //展商名字
                //适用领域
                //奇数和偶数不同处理
                float result = 0;
                string id = list[index].Trim();
                Font locationFontRegular = new Font("微软雅黑", 12, FontStyle.Regular);
                Font locationFontItalic = new Font("微软雅黑", 12, FontStyle.Italic);
                Font nameChineseFont = new Font("微软雅黑", 9, FontStyle.Bold);
                Font nameEnglishFont = new Font("微软雅黑", 8, FontStyle.Regular);
                Brush brush = new SolidBrush(Color.FromArgb(255, 0, 0, 0));
                StringFormat sfNear = new StringFormat { Alignment = StringAlignment.Near };
                StringFormat sfCenter = new StringFormat { Alignment = StringAlignment.Center };
                string[] exhibitorDetail = exhibitorsDetail[id];
                String location = exhibitorDetail[INDEX_EXHIBITOR_DETAIL_LOCATION];
                String nameChinese = exhibitorDetail[INDEX_EXHIBITOR_DETAIL_NAME_CHINESE];
                String nameEnglish = exhibitorDetail[INDEX_EXHIBITOR_DETAIL_NAME_ENGLISH];
                float itemWidth = (paperHeight / 2f - 70) / 2f;
                startX += itemWidth * (index % 2);

                string temp11 = nameChinese;
                string temp12 = "";
                SizeF nameChineseSizeF = g.MeasureString(temp11, nameChineseFont);
                while (nameChineseSizeF.Width > itemWidth - 35)
                {
                    temp12 = temp11.Substring(temp11.Length - 1, 1) + temp12;
                    temp11 = temp11.Substring(0, temp11.Length - 1);
                    nameChineseSizeF = g.MeasureString(temp11, nameChineseFont);
                }
                nameChinese = temp11.Trim() + "\n" + temp12.Trim();
                nameChineseSizeF = g.MeasureString(nameChinese, nameChineseFont);
                RectangleF nameChineseRectF = new RectangleF(new PointF(startX + 45, startY + 1), nameChineseSizeF);
                result += nameChineseSizeF.Height;

                string temp1 = nameEnglish;
                string temp2 = "";
                SizeF nameEnglishSizeF = g.MeasureString(temp1, nameEnglishFont);
                while (nameEnglishSizeF.Width > itemWidth - 35)
                {
                    temp2 = temp1.Substring(temp1.Length - 1, 1) + temp2;
                    temp1 = temp1.Substring(0, temp1.Length - 1);
                    if (temp1[temp1.Length - 1] == ' ')
                    {
                        nameEnglishSizeF = g.MeasureString(temp1, nameEnglishFont);
                        continue;
                    }
                }
                nameEnglish = temp1.Trim() + "\n" + temp2.Trim();
                nameEnglishSizeF = g.MeasureString(nameEnglish, nameEnglishFont);
                RectangleF nameEnglishRectF = new RectangleF(new PointF(startX + 45, startY + 2 + nameChineseSizeF.Height), nameEnglishSizeF);
                result += nameEnglishSizeF.Height;
                SizeF locationSizeF = g.MeasureString(location, locationFontRegular);
                float deltaHeight = (result - locationSizeF.Height) / 2f;
                RectangleF locationRectF = new RectangleF(new PointF(startX, startY + deltaHeight), new SizeF(40, locationSizeF.Height));

                float r = 0;
                if (index % 2 == 0)
                {
                    itemHeight = result;
                    r = result + 4;
                }
                else
                {
                    r = Math.Max(itemHeight, result);
                    itemHeight = 0;
                }
                if (index == list.Count - 1 && index % 2 == 0)
                {
                    g.DrawString(nameChinese, nameChineseFont, brush, nameChineseRectF, sfNear);
                    g.DrawString(nameEnglish, nameEnglishFont, brush, nameEnglishRectF, sfNear);
                    g.DrawLine(new Pen(brush), new PointF(startX + 40, startY + 4), new PointF(startX + 40, startY + result));
                    if (index <= 1)
                    {
                        g.DrawString(location, locationFontItalic, brush, locationRectF, sfCenter);
                        Font starFont = new Font("微软雅黑", 12, FontStyle.Regular);
                        g.DrawString("*", starFont, brush, new RectangleF(new PointF(locationRectF.X - 1, locationRectF.Y - 4), g.MeasureString("*", starFont)), sfCenter);
                    }
                    else
                    {
                        g.DrawString(location, locationFontRegular, brush, locationRectF, sfCenter);
                    }
                }
                else if (index % 2 == 0)
                {
                    tempNameChinese = nameChinese;
                    tempNameEnglish = nameEnglish;
                    tempLocation = location;
                    tempNameChineseRectF = nameChineseRectF;
                    tempNameEnglishRectF = nameEnglishRectF;
                    tempLocationRectF = locationRectF;
                    tempNameChineseSizeF = nameChineseSizeF;
                    tempNameEnglishSizeF = nameEnglishSizeF;
                    tempLocationSizeF = locationSizeF;
                    tempStartX = startX;
                    tempStartY = startY;
                    tempItemHeight = itemHeight;
                    tempDeltaHeight = deltaHeight;
                    tempIndex = index;
                }
                else if (index != 0)
                {
                    if (result > tempItemHeight)
                    {
                        g.DrawString(nameChinese, nameChineseFont, brush, nameChineseRectF, sfNear);
                        g.DrawString(nameEnglish, nameEnglishFont, brush, nameEnglishRectF, sfNear);
                        g.DrawLine(new Pen(brush), new PointF(startX + 40, startY + 4), new PointF(startX + 40, startY + result));
                        if (index <= 1)
                        {
                            g.DrawString(location, locationFontItalic, brush, locationRectF, sfCenter);
                            Font starFont = new Font("微软雅黑", 12, FontStyle.Regular);
                            g.DrawString("*", starFont, brush, new RectangleF(new PointF(locationRectF.X - 1, locationRectF.Y - 4), g.MeasureString("*", starFont)), sfCenter);
                        }
                        else
                        {
                            g.DrawString(location, locationFontRegular, brush, locationRectF, sfCenter);
                        }

                        float offset = (result + 4 - tempItemHeight) / 2f;
                        tempNameChineseRectF = new RectangleF(new PointF(tempStartX + 45, tempStartY + 1 + offset), tempNameChineseSizeF);
                        tempNameEnglishRectF = new RectangleF(new PointF(tempStartX + 45, tempStartY + 2 + tempNameChineseSizeF.Height + offset), tempNameEnglishSizeF);
                        tempLocationRectF = new RectangleF(new PointF(tempStartX, tempStartY + tempDeltaHeight + offset), new SizeF(40, tempLocationSizeF.Height));
                        g.DrawString(tempNameChinese, nameChineseFont, brush, tempNameChineseRectF, sfNear);
                        g.DrawString(tempNameEnglish, nameEnglishFont, brush, tempNameEnglishRectF, sfNear);
                        g.DrawLine(new Pen(brush), new PointF(tempStartX + 40, tempStartY + 4 + offset), new PointF(tempStartX + 40, tempStartY + tempItemHeight - 2 + offset));
                        if (tempIndex <= 1)
                        {
                            g.DrawString(tempLocation, locationFontItalic, brush, tempLocationRectF, sfCenter);
                            Font starFont = new Font("微软雅黑", 12, FontStyle.Regular);
                            g.DrawString("*", starFont, brush, new RectangleF(new PointF(tempLocationRectF.X - 1, tempLocationRectF.Y - 4), g.MeasureString("*", starFont)), sfCenter);
                        }
                        else
                        {
                            g.DrawString(tempLocation, locationFontRegular, brush, tempLocationRectF, sfCenter);
                        }
                    }
                    else
                    {
                        g.DrawString(tempNameChinese, nameChineseFont, brush, tempNameChineseRectF, sfNear);
                        g.DrawString(tempNameEnglish, nameEnglishFont, brush, tempNameEnglishRectF, sfNear);
                        g.DrawLine(new Pen(brush), new PointF(tempStartX + 40, tempStartY + 4), new PointF(tempStartX + 40, tempStartY + tempItemHeight - 2));
                        if (tempIndex <= 1)
                        {
                            g.DrawString(tempLocation, locationFontItalic, brush, tempLocationRectF, sfCenter);
                            Font starFont = new Font("微软雅黑", 12, FontStyle.Regular);
                            g.DrawString("*", starFont, brush, new RectangleF(new PointF(tempLocationRectF.X - 1, tempLocationRectF.Y - 4), g.MeasureString("*", starFont)), sfCenter);
                        }
                        else
                        {
                            g.DrawString(tempLocation, locationFontRegular, brush, tempLocationRectF, sfCenter);
                        }


                        float offset = (tempItemHeight - result - 4) / 2f;
                        nameChineseRectF = new RectangleF(new PointF(startX + 45, startY + 1 + offset), nameChineseSizeF);
                        nameEnglishRectF = new RectangleF(new PointF(startX + 45, startY + 2 + nameChineseSizeF.Height + offset), nameEnglishSizeF);
                        locationRectF = new RectangleF(new PointF(startX, startY + deltaHeight + offset), new SizeF(40, locationSizeF.Height));
                        g.DrawString(nameChinese, nameChineseFont, brush, nameChineseRectF, sfNear);
                        g.DrawString(nameEnglish, nameEnglishFont, brush, nameEnglishRectF, sfNear);
                        g.DrawLine(new Pen(brush), new PointF(startX + 40, startY + 4 + offset), new PointF(startX + 40, startY + result - 2 + offset));
                        if (index <= 1)
                        {
                            g.DrawString(location, locationFontItalic, brush, locationRectF, sfCenter);
                            Font starFont = new Font("微软雅黑", 12, FontStyle.Regular);
                            g.DrawString("*", starFont, brush, new RectangleF(new PointF(locationRectF.X - 1, locationRectF.Y - 4), g.MeasureString("*", starFont)), sfCenter);
                        }
                        else
                        {
                            g.DrawString(location, locationFontRegular, brush, locationRectF, sfCenter);
                        }
                    }
                }
                if (index == list.Count - 1)
                {
                    return r + 8;
                }
                else
                {
                    return (index % 2) * r;
                }
            }

            public void initExhibitorsDetail()
            {
                string exhibitorsInfoFilePath = data.exhibitorsInfoPath;
                //string exhibitorsInfoFilePath = @".\exhibitors_info.txt";
                string rawData = "";
                exhibitorsDetail = new Dictionary<string, string[]>();
                try
                {
                    rawData = File.ReadAllText(exhibitorsInfoFilePath);
                    string[] dataRow = rawData.Trim().Split('\n');
                    for (int i = 0; i < dataRow.Length; i++)
                    {
                        string[] dataArr = dataRow[i].Trim().Split('|');
                        exhibitorsDetail.Add(dataArr[INDEX_EXHIBITOR_DETAIL_ID], dataArr);
                    }
                }
                catch (Exception e)
                {
                    return;
                }
            }

            public string generateLists(string filePath)
            {
                Console.WriteLine("exist file");
                string exhibitorsData = File.ReadAllText(filePath);
                string[] strRow = exhibitorsData.Trim().Split('\n');
                for (int i = 0; i < strRow.Length; i++)
                {
                    string str = strRow[i].Trim();
                    string[] strArr = str.Split(',');
                    if (strArr.Length > 1)
                    {
                        List<string> list = new List<string>();
                        for (int j = 1; j < strArr.Length; j++)
                        {
                            list.Add(strArr[j]);
                        }
                        recommendedData.Add(strArr[0], list);
                    }
                }
                return "exist file";
            }

            public string generateLists()
            {
                Console.WriteLine("not exist file");
                string exhibitorsRecommendedFilePath = data.exhibitorsRecommendedPath;
                //string exhibitorsRecommendedFilePath = @".\exhibitors_recommended.txt";
                string exhibitorsData = "";
                try
                {
                    exhibitorsData = File.ReadAllText(exhibitorsRecommendedFilePath);
                }
                catch (Exception e)
                {
                }
                const int A = 0;
                const int B = 1;
                const int C = 2;
                const int D = 3;
                const int E = 4;
                const int F = 5;
                const int INDEX_NULL = -1;
                const int INDEX_FIELDA = 0;
                const int INDEX_FIELDB = 1;
                const int INDEX_FIELDC = 2;
                const int INDEX_FIELDD = 3;
                const int INDEX_FIELDE = 4;
                const int INDEX_FIELDF = 5;
                bool[] selected = new bool[6];
                try
                {
                    string[] fieldList = exhibitorsData.Trim().Split('\n');
                    int sum = 0;
                    if (data.FieldA != null)
                    {
                        int a = data.FieldA;
                        selected[A] = a == 1;
                        sum += a;
                    }
                    if (data.FieldB != null)
                    {
                        int b = data.FieldB;
                        selected[B] = b == 1;
                        sum += b;
                    }
                    if (data.FieldC != null)
                    {
                        int c = data.FieldC;
                        selected[C] = c == 1;
                        sum += c;
                    }
                    if (data.FieldD != null)
                    {
                        int d = data.FieldD;
                        selected[D] = d == 1;
                        sum += d;
                    }
                    if (data.FieldE != null)
                    {
                        int e = data.FieldE;
                        selected[E] = e == 1;
                        sum += e;
                    }
                    if (data.FieldF != null)
                    {
                        int f = data.FieldF;
                        selected[F] = f == 1;
                        sum += f;
                    }
                    //for (int i = 0; i < indexArr.Length; i++)
                    //{
                    //    selected[i] = false;
                    //}
                    //selected[B] = true;
                    //sum = 1;
                    HashSet<string> userRecommendData = new HashSet<string>();
                    int constTotalCount = 24 - sum;
                    int totalCount = constTotalCount;
                    for (int i = F; i >= A; i--)
                    {
                        if (selected[i])
                        {
                            int count = constTotalCount / sum;
                            List<string> list = new List<string>();
                            string[] allList = fieldList[i].Split(',');
                            if (count >= allList.Length)
                            {
                                for (int index = 0; index < allList.Length; index++)
                                {
                                    list.Add(allList[index]);
                                    userRecommendData.Add(allList[index]);
                                    totalCount--;
                                }
                                recommendedData.Add(indexArr[i], list);
                            }
                            else
                            {
                                int c = count / 2;
                                for (int index = 0; index < c; index++)
                                {
                                    list.Add(allList[index]);
                                    userRecommendData.Add(allList[index]);
                                    totalCount--;
                                    count--;
                                }
                                while(count > 0)
                                {
                                    int index = random.Next(allList.Length);
                                    if (userRecommendData.Contains(allList[index]))
                                    {
                                        continue;
                                    }
                                    list.Add(allList[index]);
                                    userRecommendData.Add(allList[index]);
                                    count--;
                                    totalCount--;
                                }
                                recommendedData.Add(indexArr[i], list);
                            }
                            totalCount--;
                        }
                    }
                    string[] strArr1 = fieldList[A].Split(',');
                    int temp = totalCount / 2;
                    while (temp > 0)
                    {
                        int index = random.Next(strArr1.Length);
                        if (userRecommendData.Contains(strArr1[index]))
                        {
                            continue;
                        }
                        if (!recommendedData.ContainsKey(indexArr[A]))
                        {
                            List<string> list = new List<string>();
                            list.Add(strArr1[index]);
                            recommendedData.Add(indexArr[A], list);
                            temp--;
                            totalCount--;
                        }
                        else
                        {
                            recommendedData[indexArr[0]].Add(strArr1[index]);
                        }
                        userRecommendData.Add(strArr1[index]);
                        temp--;
                        totalCount--;
                    }
                    string[] strArr2 = fieldList[E].Split(',');
                    while (totalCount > 0)
                    {
                        int index = random.Next(strArr2.Length);
                        if (userRecommendData.Contains(strArr2[index]))
                        {
                            continue;
                        }
                        if (!recommendedData.ContainsKey(indexArr[E]))
                        {
                            List<string> list = new List<string>();
                            list.Add(strArr2[index]);
                            recommendedData.Add(indexArr[E], list);
                            totalCount--;
                        }
                        else
                        {
                            recommendedData[indexArr[E]].Add(strArr2[index]);
                        }
                        userRecommendData.Add(strArr2[index]);
                        totalCount--;
                    }

                    if (!Directory.Exists(@".\data"))
                    {
                        Directory.CreateDirectory(@".\data");
                    }
                    FileStream fs = new FileStream(@".\data\" + data.id + ".txt", FileMode.Create);
                    //FileStream fs = new FileStream(@".\data\" + id + ".txt", FileMode.Create);
                    StreamWriter sw = new StreamWriter(fs);
                    for (int i = 0; i < indexArr.Length; i++)
                    {
                        string key = indexArr[i];
                        if (recommendedData.ContainsKey(key))
                        {
                            sw.Write(key);
                            sw.Write(",");
                            List<string> list = recommendedData[key];
                            for (int j = 0; j < list.Count; j++)
                            {
                                if (j == list.Count - 1)
                                {
                                    sw.WriteLine(list[j].Trim());
                                }
                                else
                                {
                                    sw.Write(list[j].Trim());
                                    sw.Write(",");
                                }
                            }
                        }
                        else
                        {
                            sw.WriteLine(key);
                        }
                    }
                    sw.Close();
                    fs.Close();
                    return @".\data\" + data.id + ".txt";
                    //return @".\data\" + id + ".txt";
                }
                catch (Exception e)
                {
                    Console.WriteLine("error : " + e.Message);
                    return "error : " + e.Message;
                }
    }
}


            */});


process.on('message', function(para) {
    printer(para, function(err, result) {
        process.send({err:err,res:result});
    });
});