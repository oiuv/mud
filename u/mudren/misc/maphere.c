//Map here功能，需要优化排版问题
//由于严重影响速度（递归调用导致！），所以进行此命令的使用应该减少玩家的精力或者气息
#include <ansi.h>

#define MaxX 7
#define MaxY 30

inherit F_CLEAN_UP;

int X=7,Y=10;
nosave mixed m;
nosave string *rfile;
int draw_room(int,int,object);

int main(object me, string arg)
{
    object where;
    int i, j;
    string tmp;

    if (me->query("qi") < 40)
        return notify_fail("你的体力不太好了，先休息一下吧！\n");
    me->add("qi", -20);
    if (arg)
    {
        //允许在指定范围内自定义房间搜索范围！
        arg = lower_case(arg);
        sscanf(arg, "%*sx=%d%*s", X);
        sscanf(arg, "%*sy=%d%*s", Y);
        if (X > MaxX || X == 0)
            X = MaxX;
        if (Y > MaxY || Y == 0)
            Y = MaxY;
    }
    tmp = "即时地图v1.0 地图大小：" + X + "/" + Y + "\n";
    m = allocate(2 * X + 1);
    rfile = ({});
    for (i = 0; i < 2 * X + 1; i++)
    {
        m[i] = allocate(2 * Y + 1);
        for (j = 0; j < 2 * Y + 1; j++)
            m[i][j] = " ";
    }
    where = environment(me);
    if (!objectp(where))
        return notify_fail("对不起，不知道你到底在哪里呀！找巫师吧！\n");
    draw_room((2 * X + 1) / 2, (2 * Y + 1) / 2, where);
    for (i = 0; i < 2 * Y + 1; i++)
    {
        for (j = 0; j < 2 * X + 1; j++)
        {
            if (m[j][i] == " " && i % 2 && j % 2)
                tmp += "        ";
            else
            {
                //如果此项为空，并且此时j为偶数列，则输出空格
                if (m[j][i] == " " && !(j % 2))
                    tmp += "  ";
                else if (m[j][i] == " ")
                    tmp += "        ";
                else
                {
                    tmp += m[j][i];
                    //if(!(i%2)&&!(j%2))
                    if (m[j][i] != "--")
                        for (int d = 4 - sizeof(remove_ansi(m[j][i])); d > 0; d--)
                            tmp += " ";
                }
            }
        }
        tmp += "\n";
    }
    me->start_more(tmp);
    return 1;
}

object find_room(string path)
{
    object ob;
    if (objectp(ob = find_object(path)) || objectp(ob = load_object(path)))
        return ob;
    return 0;
}

//←↑→↓↖↗↘↙
int draw_path(int x, int y, string direc)
{
    string str;
    int xx = 0, yy = 0;
    switch (direc)
    {
    case "south":
    case "north":
        str = "   ｜   ";
        break;
    case "southdown":
    case "northup":
        str = "↑";
        break;
    case "southup":
    case "northdown":
        str = "↓";
        break;
    case "east":
    case "west":
        str = "--";
        break;
    case "eastup":
    case "westdown":
        str = "→";
        break;
    case "westup":
    case "eastdown":
        str = "←";
        break;
    case "southeast":
    case "northwest":
        str = "↗";
        break;
    case "shothwest":
    case "northeast":
        str = "↖";
        break;
    default:
        return 0;
    }
    if (sscanf(direc, "%*ssouth%*s"))
        yy++;
    if (sscanf(direc, "%*snorth%*s"))
        yy--;
    if (sscanf(direc, "%*seast%*s"))
        xx++;
    if (sscanf(direc, "%*swest%*s"))
        xx--;
    if (x + xx < 0 || y + yy < 0 || x + xx > 2 * X || y + yy > 2 * Y)
        return 0;
    //write("设置第 "+(x+xx)+ " "+(y+yy)+" 项\n");
    m[x + xx][y + yy] = str;
    return 1;
}

int draw_room(int x, int y, object room)
{
    int i, nst = 0, xx, yy;
    string name, *dirs;
    object nroom;
    mapping dir;
    reset_eval_cost();
    if (x < 0 || y < 0 || !objectp(room) || x > 2 * X || y > 2 * Y)
        return 0;
    name = remove_ansi(room->query("short")); //求取无颜色的房间short描述
    //write("坐标："+x+" / "+ y+ "处理 "+name+" 文件名："+base_name(room)+"\n");
    rfile = rfile + ({base_name(room)});
    dir = room->query("exits");
    if (!mapp(dir) || sizeof(dir) < 1)
        return 0;
    dirs = keys(dir);
    for (i = 0; i < sizeof(dirs); i++)
    {
        xx = 0;
        yy = 0;
        if (sscanf(dirs[i], "%*ssouth%*s"))
            yy += 2;
        if (sscanf(dirs[i], "%*snorth%*s"))
            yy -= 2;
        if (sscanf(dirs[i], "%*seast%*s"))
            xx += 2;
        if (sscanf(dirs[i], "%*swest%*s"))
            xx -= 2;
        if (!draw_path(x, y, dirs[i]) || (xx == 0 && yy == 0))
            nst = 1;
        nroom = find_room(dir[dirs[i]]);
        //避免重复调用
        if (!objectp(nroom) || nst)
            continue;
        if (member_array(base_name(nroom), rfile) == -1)
            draw_room(x + xx, y + yy, nroom);
    }
    if (strlen(name) > 4)
        name = name[0..3];
    if (strlen(name) < 4) //对不足4个汉字的房间名进行居中处理
    {
        switch (strlen(name))
        {
        case 3:
            name = sprintf(" %c%c%c ", name[0], name[1], name[2]);
            break;
        case 2:
            name = sprintf("  %c%c  ", name[0], name[1]);
            break;
        }
    }
    if (nst)
        name = HIY + name;
    if ((x == (2 * X + 1) / 2) && (y == (2 * Y + 1) / 2))
        name = BLINK + name;
    name += NOR;
    m[x][y] = name;
    return 1;
}

int help(object me)
{
    write(@HELP
    命令用法：map [x=1-7] [y=1-30]
本命令帮助玩家了解周围的房间地图的分布状况，并标志出房间之间的连接情况。
理论上讲，该命令应该能完全正确地反应地图，但是由于巫师设计地图不规范等多
种原因（比如迷宫、有不规范出口比如enter之类的，房间之间无法双向关联等），
导致地图可能在显示时与行走方向上有一定区别，甚至会出现走一步路，地图就完
全变样的情况。比如，房间A可以从south走到B房间，但是B房间走north却走到C房
间，这时在A用该命令与在B用该命令效果完全不一样！
此外，连接标志中箭头所指方向地势更高，有不规范出口的房间以黄色标志，你所
处的房间以闪烁来标志！
本命令默认以x=7,y=10 的地图大小显示，你可以在命令行手动指定地图大小。
HELP);
    return 1;
}
