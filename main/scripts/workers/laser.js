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
        public Dictionary<String, List<string>> recommandData = new Dictionary<string, List<string>>();
        private string[] indexArr = new string[] { "A", "B", "C", "D", "E", "F" };
        private string[] indexArrContent = new string[] {"3D打印与增材制造设备 / AM and 3D Printing Machine","原型制造与产品开发 / Prototyping and Product Development",
            "软件系统 / Software","3D扫描与数字化模块 / Scanning and Metrology","3D打印耗材部分 / Materials","3D打印部件与其他服务"};
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

        public async Task<object> Invoke(dynamic data)
        {
            //this.data = data;
            generateLists();
            initExhibitorsDetail();
            PrintDocument guidePrintDocument = new PrintDocument();
            guidePrintDocument.PrinterSettings.PrinterName = "\\\\SYNORME\\Samsung M262x 282x Series";
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
            Console.WriteLine("finish");
            return data;
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
            float originX = paperHeight / 2 + 30;
            float originY = 50;
            float currentX = originX;
            float currentY = originY;
            for (int i = 0; i < recommandData.Count; i++)
            {
                List<string> list = recommandData[indexArr[i]];
                currentY +=  drawH1(g, currentX, currentY, indexArrContent[i]);
                for (int j = 0; j < list.Count; j++)
                {
                    currentY += drawItem(g, currentX, currentY, j, list);
                }
            }
            Console.WriteLine("print finish");
        }

        public float drawH1(Graphics g, float startX, float startY, string content)
        {
            //大类标题
            //大类下的水平线
            Font font = new Font("微软雅黑", 12, FontStyle.Regular);
            Brush brush = new SolidBrush(Color.FromArgb(255, 0, 0, 0));
            StringFormat stringFormat = new StringFormat { Alignment = StringAlignment.Near };
            SizeF sizeF = g.MeasureString(content, font);
            RectangleF rect = new RectangleF(new PointF(startX, startY), new SizeF(paperHeight / 2 -  60, sizeF.Height));
            g.DrawString(content, font, brush, rect, stringFormat);
            g.DrawLine(new Pen(brush, 2), new PointF(startX, startY + sizeF.Height + 2), new PointF(startX + paperHeight / 2 - 60, startY + sizeF.Height + 2));
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
            Font locationFont = new Font("微软雅黑", 12, FontStyle.Regular);
            Font nameChineseFont = new Font("微软雅黑", 9, FontStyle.Bold);
            Font nameEnglishFont = new Font("微软雅黑", 8, FontStyle.Regular);
            Brush brush = new SolidBrush(Color.FromArgb(255, 0, 0, 0));
            StringFormat sfNear = new StringFormat { Alignment = StringAlignment.Near };
            StringFormat sfCenter = new StringFormat { Alignment = StringAlignment.Center };
            string[] exhibitorDetail = exhibitorsDetail[id];
            String location = exhibitorDetail[INDEX_EXHIBITOR_DETAIL_LOCATION];
            String nameChinese = exhibitorDetail[INDEX_EXHIBITOR_DETAIL_NAME_CHINESE];
            String nameEnglish = exhibitorDetail[INDEX_EXHIBITOR_DETAIL_NAME_ENGLISH];
            float itemWidth = (paperHeight / 2f - 80) / 2f;
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
            SizeF locationSizeF = g.MeasureString(location, locationFont);
            float deltaHeight = (result - locationSizeF.Height) / 2;
            RectangleF locationRectF = new RectangleF(new PointF(startX, startY + deltaHeight), new SizeF(40, locationSizeF.Height));

            float r = 0;
            if (index % 2 == 0)
            {
                itemHeight = result + 4;
                r = result + 4;
            }
            else
            {
                r = Math.Max(itemHeight, result);
                itemHeight = 0;
            }
            //g.DrawString(tempNameChinese, nameChineseFont, brush, tempNameChineseRectF, sfNear);
            //g.DrawString(tempNameEnglish, nameEnglishFont, brush, tempNameEnglishRectF, sfNear);
            //g.DrawLine(new Pen(brush), new PointF(tempStartX + 40, tempStartY + 2), new PointF(tempStartX + 40, tempStartY + tempItemHeight - 2));
            //g.DrawString(tempLocation, locationFont, brush, tempLocationRectF, sfCenter);
            if (index == list.Count - 1)
            {
                g.DrawString(nameChinese, nameChineseFont, brush, nameChineseRectF, sfNear);
                g.DrawString(nameEnglish, nameEnglishFont, brush, nameEnglishRectF, sfNear);
                g.DrawLine(new Pen(brush), new PointF(startX + 40, startY + 2), new PointF(startX + 40, startY + result - 2));
                g.DrawString(location, locationFont, brush, locationRectF, sfCenter);
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
            }
            else if (index != 0)
            {
                if (result + 1 > tempItemHeight)
                {
                    g.DrawString(nameChinese, nameChineseFont, brush, nameChineseRectF, sfNear);
                    g.DrawString(nameEnglish, nameEnglishFont, brush, nameEnglishRectF, sfNear);
                    g.DrawLine(new Pen(brush), new PointF(startX + 40, startY + 2), new PointF(startX + 40, startY + result - 2));
                    g.DrawString(location, locationFont, brush, locationRectF, sfCenter);

                    float offset = (result + 4 - tempItemHeight) / 2;
                    tempNameChineseRectF = new RectangleF(new PointF(tempStartX + 45, tempStartY + 1 + offset), tempNameChineseSizeF);
                    tempNameEnglishRectF = new RectangleF(new PointF(tempStartX + 45, tempStartY + 2 + tempNameChineseSizeF.Height + offset), tempNameEnglishSizeF);
                    tempLocationRectF = new RectangleF(new PointF(tempStartX, tempStartY + tempDeltaHeight + offset), new SizeF(40, tempLocationSizeF.Height));
                    g.DrawString(tempNameChinese, nameChineseFont, brush, tempNameChineseRectF, sfNear);
                    g.DrawString(tempNameEnglish, nameEnglishFont, brush, tempNameEnglishRectF, sfNear);
                    g.DrawLine(new Pen(brush), new PointF(tempStartX + 40, tempStartY + 2 + offset), new PointF(tempStartX + 40, tempStartY + tempItemHeight - 2 + offset));
                    g.DrawString(tempLocation, locationFont, brush, tempLocationRectF, sfCenter);
                }
                else
                {
                    g.DrawString(tempNameChinese, nameChineseFont, brush, tempNameChineseRectF, sfNear);
                    g.DrawString(tempNameEnglish, nameEnglishFont, brush, tempNameEnglishRectF, sfNear);
                    g.DrawLine(new Pen(brush), new PointF(tempStartX + 40, tempStartY + 2), new PointF(tempStartX + 40, tempStartY + tempItemHeight - 2));
                    g.DrawString(tempLocation, locationFont, brush, tempLocationRectF, sfCenter);

                    float offset = (tempItemHeight - result - 4) / 2;
                    nameChineseRectF = new RectangleF(new PointF(startX + 45, startY + 1 + offset), nameChineseSizeF);
                    nameEnglishRectF = new RectangleF(new PointF(startX + 45, startY + 2 + nameChineseSizeF.Height + offset), nameEnglishSizeF);
                    locationRectF = new RectangleF(new PointF(startX, startY + deltaHeight + offset), new SizeF(40, locationSizeF.Height));
                    g.DrawString(nameChinese, nameChineseFont, brush, nameChineseRectF, sfNear);
                    g.DrawString(nameEnglish, nameEnglishFont, brush, nameEnglishRectF, sfNear);
                    g.DrawLine(new Pen(brush), new PointF(startX + 40, startY + 2 + offset), new PointF(startX + 40, startY + result - 2 + offset));
                    g.DrawString(location, locationFont, brush, locationRectF, sfCenter);
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
            string exhibitorsDetailFilePath = @".\exhibitors_info.txt";
            string rawData = "";
            exhibitorsDetail = new Dictionary<string, string[]>();
            try
            {
                rawData = File.ReadAllText(exhibitorsDetailFilePath);
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

        public void generateLists()
        {
            //string exhibitorsFilePath = data.exhibitorsFilePath;
            string exhibitorsFilePath = @".\exhibitors_recommended.txt";
            string exhibitorsData = "";
            try
            {
                exhibitorsData = File.ReadAllText(exhibitorsFilePath);
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
                //if (data.FieldA != null)
                //{
                //    int a = data.FieldA;
                //    selected[A] = a == 1;
                //    sum += a;
                //}
                //if (data.FieldB != null)
                //{
                //    int b = data.FieldB;
                //    selected[B] = b == 1;
                //    sum += b;
                //}
                //if (data.FieldC != null)
                //{
                //    int c = data.FieldC;
                //    selected[C] = c == 1;
                //    sum += c;
                //}
                //if (data.FieldD != null)
                //{
                //    int d = data.FieldD;
                //    selected[D] = d == 1;
                //    sum += d;
                //}
                //if (data.FieldE != null)
                //{
                //    int e = data.FieldE;
                //    selected[E] = e == 1;
                //    sum += e;
                //}
                //if (data.FieldF != null)
                //{
                //    int f = data.FieldF;
                //    selected[F] = f == 1;
                //    sum += f;
                //}
                for (int i = 0; i < selected.Length; i++)
                {
                    selected[i] = true;
                    sum++;
                }
                HashSet<string> userRecommendData = new HashSet<string>();
                int constTotalCount = 26 - sum;
                int totalCount = constTotalCount;
                for (int i = F; i >= A; i--)
                {
                    if (selected[i])
                    {
                        /// 具体数量与sum有关，还没定
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
                            recommandData.Add(indexArr[i], list);
                        }
                        else
                        {
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
                            recommandData.Add(indexArr[i], list);
                        }
                    }
                    totalCount--;
                }
                string[] strArr = fieldList[0].Split(',');
                while (totalCount > 0)
                {
                    int index = random.Next(strArr.Length);
                    if (userRecommendData.Contains(strArr[index]))
                    {
                        continue;
                    }
                    recommandData[indexArr[0]].Add(strArr[index]);
                    userRecommendData.Add(strArr[index]);
                    totalCount--;
                }
            }
            catch (Exception e)
            {
            }
        }
    }
*/});


process.on('message', function(para) {
    printer(para, function(error, result) {
        if (error) console.error(err);
        process.send(result);
    });
});