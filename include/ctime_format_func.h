// naihe 05-8-16 13:18
//    自从 2003-04-29 使用 ctime_new() 函数以来，一直觉得有些不爽
//    今天改成新的方式，兼容旧的，新的更好！
#include "localtime.h"
#define        LT_MON_ADD            1        // 有些OS存在这个BUG，没有把 LT_MON 加一，可以修正一下
#define        DEFAULT_FORMAT_STR    "YY.M.D(w) h:m:s"  // 默认标准表述格式

string ctime_format_help()
{
    string msg;
    msg = "\n"
    + "varargs string ctime_format( mixed arg1, mixed arg2 ) 帮助：\n"
    + "----------------------------------------------------------------------\n"
    + "函数说明：根据自定义的格式，把一个时间数字所代表的时间信息表述出来。\n"
    + "          (返回 string 信息)\n"
    + "传入参数：1、(string) 格式规范(sFormat)\n"
    + "          2、(int) 欲查询的时间(iTime)\n"
    + "兼容：    自由传入参数，使代码编写更方便。\n"
    + "          规则：1、省略参数时，得到当前时间的默认格式表述；\n"
    + "                2、只传入 (int) iTime 时，使用默认格式表述；\n"
    + "                3、只传入 (string) sFormat 时，使用当前时间表述；\n"
    + "                4、两个参数都传入时，根据你的设置表述。\n";
    msg += ""
    + "格式规范：["+DEFAULT_FORMAT_STR+"] 是标准的格式，其中：\n"
    + "           YY 将被替换成为年份的数字如：2005\n"
    + "           Y  优先替换 YY 之后，Y 将被替换为短年份格式如：05\n"
    + "           M  将被替换成为月份的数字如：02, 11\n"
    + "           D  将被替换成为日期的数字如：08, 31\n"
    + "           w  将被替换成为星期的汉字如：三，日，六\n"
    + "           h  将被替换成为小时的数字如：01, 24\n"
    + "           m  将被替换成为分钟的数字如：01, 58\n"
    + "           s  将被替换成为秒钟的数字如：08, 59\n";
    msg += ""
    + "           根据以上规律，你可以自定需要的格式，例如：\n"
    + "           ctime_format( \"Y-M-D h:m:s 星期w\",1124174889 )  即得出：\n"
    + "               05-08-16 14:48:09 星期二  这种非规范的格式。\n"
    + "----------------------------------------------------------------------\n";
    return msg;
}

string i_to_s( int num )
{
    if( num == 0 )
        return "00";
    if( num < 10 )
        return sprintf( "0%d", num );
    return sprintf( "%d", num );
}
// 这是真正的检测函数。喜欢的话，也可以直接调它；但是还是经过检测的安全些吧。
string ctime_format_real( int iTime, string sFormat )
{
    mixed *lt;
    string wday;
    if( !iTime || !sFormat )
        return 0;
    lt = localtime( iTime );
    if( !lt || !sizeof(lt) )
        return 0;
    // 获得星期几的中文
    wday = chinese_number( lt[ LT_WDAY ] );
    if( lt[ LT_WDAY ] == 0 )
        wday = "日";
    sFormat = replace_string( sFormat, "YY", i_to_s(lt[LT_YEAR]) );      // 注：这句要在 Y 前
    sFormat = replace_string( sFormat, "Y", (lt[LT_YEAR]+"")[2..<1] );   // 注：这句要在 YY 后
    sFormat = replace_string( sFormat, "M", i_to_s(lt[LT_MON]+LT_MON_ADD) );
    sFormat = replace_string( sFormat, "D", i_to_s(lt[LT_MDAY]) );
    sFormat = replace_string( sFormat, "w", wday );
    sFormat = replace_string( sFormat, "h", i_to_s(lt[LT_HOUR]) );
    sFormat = replace_string( sFormat, "m", i_to_s(lt[LT_MIN]) );
    sFormat = replace_string( sFormat, "s", i_to_s(lt[LT_SEC]) );
    return sFormat;
}

varargs string ctime_format( mixed arg1, mixed arg2 )
{
    string sFormat;
    int iTime;
    
    // 忽略2个参数时，即以默认格式获得当前时间的表述
    if( !arg1 && !arg2 )
    {
        return ctime_format_real( time(), DEFAULT_FORMAT_STR );
    }
    // 忽略第二个参数时
    if( arg1 && !arg2 )
    {
        if( stringp(arg1) )
        {
            sFormat = arg1;
            iTime = time();
        }
        else if( intp(arg1) && arg1 > 0 )
        {
            iTime = arg1;
            sFormat = DEFAULT_FORMAT_STR;
        }
        else
            return 0;
    }
    // 忽略第一个参数时(例如传入 0, 1)
    if( !arg1 && arg2 )
    {
        if( stringp(arg2) )
        {
            sFormat = arg2;
            iTime = time();
        }
        else if( intp(arg2) && arg2 > 0 )
        {
            iTime = arg2;
            sFormat = DEFAULT_FORMAT_STR;
        }
        else
            return 0;
    }
    // 两个参数都有时
    if( arg1 && arg2 )
    {
        if( intp(arg1) && arg1 > 0 && stringp(arg2) )
        {
            iTime = arg1;
            sFormat = arg2;
        }
        else if( stringp(arg1) && intp(arg2) && arg2 > 0 )
        {
            iTime = arg2;
            sFormat = arg1;
        }
        else
            return 0;
    }
    return ctime_format_real( iTime, sFormat );
}
