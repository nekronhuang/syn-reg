var edge = require('edge'),
    printer = edge.func(function() {/*
    #r "System.Drawing.dll"
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.IO;
    using System.Drawing;
    using System.Drawing.Printing;
    using System.Threading.Tasks;

    public class Startup {
        private int _PrintPage = 0; //当前打印页
        private int _TotalPage = 1; //总页数
        dynamic s;
        public async Task < object > Invoke(dynamic input) {
            s = input;
            if (s.method == "0") {
                //获取可用打印机名称
                s.name = "";
                String pkInstalledPrinters;
                for (int i = 0; i < PrinterSettings.InstalledPrinters.Count; i++) {
                    pkInstalledPrinters = PrinterSettings.InstalledPrinters[i];
                    if (i == PrinterSettings.InstalledPrinters.Count - 1)
                        s.name += pkInstalledPrinters;
                    else
                        s.name += (pkInstalledPrinters + ",");
                }
            } else if (s.method == "1") {
                PrintDocument pd = new PrintDocument();
                pd.PrinterSettings.PrinterName = s.printname; //设置打印机
                pd.PrintPage += new PrintPageEventHandler(this.print_page_map);
                pd.DefaultPageSettings.Landscape = true;
                pd.Print();
            } else if (s.method == "2") {
                PrintDocument pd = new PrintDocument();
                pd.PrinterSettings.PrinterName = s.printname; //设置打印机
                //pd.DefaultPageSettings.PaperSize = new System.Drawing.Printing.PaperSize("SpecimenLabel", 236, 157);//页面大小
                pd.DefaultPageSettings.PaperSize = new System.Drawing.Printing.PaperSize("SpecimenLabel", Convert.ToInt32(s.page_w), Convert.ToInt32(s.page_h)); //页面大小
                pd.PrintPage += new PrintPageEventHandler(this.print_page_code);
                pd.Print();
            }
            return s;
        }
        private void print_page_map(object sender, PrintPageEventArgs e) {
            try {
                Image img = Image.FromFile(@"D:\192.jpg");
                e.Graphics.DrawImage(img, 109, 78, 20, 20);
                e.HasMorePages = false;

            } catch (Exception exception) {

            }
        }
        private void print_page_code(object sender, PrintPageEventArgs e) {
            Graphics g = e.Graphics;
            int page_w = Convert.ToInt32(s.page_w);
            int page_h = Convert.ToInt32(s.page_h);
            //float leftMargin = 5f; //左边距
            SolidBrush myBrush = new SolidBrush(Color.Black); //刷子
            float yPosition = float.Parse(s.content.origin_h); //行定位

            //Font printFont = new Font("微软雅黑", float.Parse(s.content.content1.size), FontStyle.Bold);//设置字体
            //Rectangle dispalyrectangle1 = new Rectangle(0, Convert.ToInt32(yPosition), page_w, Convert.ToInt32(printFont.GetHeight(g)));
            Font printFont;
            Rectangle displayrectanle;
            StringFormat sformat = new StringFormat();
            sformat.Alignment = StringAlignment.Center;
            for (Int32 i = 0; i < Convert.ToInt32(s.content.content_num); i++) {
                //设置字体style
                if (s.content.content_core[i].style == "0")
                    printFont = new Font("微软雅黑", float.Parse(s.content.content_core[i].size), FontStyle.Regular);
                else if (s.content.content_core[i].style == "1")
                    printFont = new Font("微软雅黑", float.Parse(s.content.content_core[i].size), FontStyle.Bold);
                else if (s.content.content_core[i].style == "2")
                    printFont = new Font("微软雅黑", float.Parse(s.content.content_core[i].size), FontStyle.Italic);
                else if (s.content.content_core[i].style == "3")
                    printFont = new Font("微软雅黑", float.Parse(s.content.content_core[i].size), FontStyle.Strikeout);
                else if (s.content.content_core[i].style == "4")
                    printFont = new Font("微软雅黑", float.Parse(s.content.content_core[i].size), FontStyle.Underline);
                else
                    printFont = new Font("微软雅黑", float.Parse(s.content.content_core[i].size), FontStyle.Regular);
                if (s.content.content_core[i].special == "0") {
                    //printFont = new Font("微软雅黑", float.Parse(s.content.content_core[i].size), FontStyle.Bold);
                    displayrectanle = new Rectangle(0, Convert.ToInt32(yPosition), page_w, Convert.ToInt32(printFont.GetHeight(g)));
                    g.DrawString(s.content.content_core[i].text, printFont, myBrush, displayrectanle, sformat);
                    yPosition += (printFont.GetHeight(g) + float.Parse(s.content.content_core[i].space));
                } else if (s.content.content_core[i].special == "1") {
                    //printFont = new Font("微软雅黑", float.Parse(s.content.content_core[i].size), FontStyle.Bold);
                    displayrectanle = new Rectangle(0, Convert.ToInt32(s.content.content_core[i].yPos), page_w, Convert.ToInt32(printFont.GetHeight(g)));
                    g.DrawString(s.content.content_core[i].text, printFont, myBrush, displayrectanle, sformat);
                } else if (s.content.content_core[i].special == "2") {
                    //printFont = new Font("微软雅黑", float.Parse(s.content.content_core[i].size), FontStyle.Bold);
                    sformat.Alignment = StringAlignment.Near;
                    displayrectanle = new Rectangle(Convert.ToInt32(s.content.content_core[i].xPos), Convert.ToInt32(s.content.content_core[i].yPos), page_w, Convert.ToInt32(printFont.GetHeight(g)));
                    g.DrawString(s.content.content_core[i].text, printFont, myBrush, displayrectanle, sformat);
                }
            }
            //StringFormat sformat = new StringFormat();
            //sformat.Alignment = StringAlignment.Center;
            //g.DrawString(s.content.content1.text, printFont, myBrush, dispalyrectangle1, sformat);
            //yPosition += printFont.GetHeight(g);//另起一行
            //printFont = new Font("微软雅黑", float.Parse(s.content.content2.size), FontStyle.Bold);//改变字体
            //Rectangle dispalyrectangle2 = new Rectangle(0, Convert.ToInt32(yPosition), page_w, Convert.ToInt32(printFont.GetHeight(g)));
            //g.DrawString(s.content.content2.text, printFont, myBrush, dispalyrectangle2, sformat);
            //如果要同时打印多个标签
            _PrintPage++; //页号
            if (_PrintPage < _TotalPage) {
                e.HasMorePages = true;
            } else {
                e.HasMorePages = false;
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