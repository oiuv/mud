#include <ansi.h>

inherit ROOM;
#define TSROB __DIR__"tsr_dugu-jiujian"

string look_door();

void create()
{
        string msg;

        set("short", "峭壁");
        set("exits", ([
                "hole1" : __DIR__"lockroom1",
                "hole2" : __DIR__"lockroom2",
                "hole3" : __DIR__"lockroom3",
                "hole4" : __DIR__"lockroom4",
                "hole5" : __DIR__"lockroom5",
                "hole6" : __DIR__"lockroom6",
                "out"   : __DIR__"shandong",
        ]));

        set("long", @LONG
四周悬崖峭壁，只见前方隐然是一个山洞，但是被一个巨
大的石门（door）封住了，石门上却插着六把形状奇特火炬（huoju）。 
细看石门周围，只见有六个像是人工开凿小山洞。
LONG);

        set("item_desc", ([
               "door"   : (: look_door :),
               "huoju"  : HIR "这些火炬看来很奇怪，似乎连接着什么机关！\n" NOR,
        ]));

        set("no_clean_up", 0);
        setup();
}

void init()
{
        object tsrob;
        if (! tsrob = find_object(TSROB))
                 tsrob = load_object(TSROB);
        
}

string look_door()
{
        object ob;
        int n;
        string opened, msg, temp;

        mapping change_num = ([
               "1" : "一",
               "2" : "二",
               "3" : "三",
               "4" : "四",
               "5" : "五",
               "6" : "六",
        ]);

        ob = find_object(TSROB);

        if (! objectp(ob))
               return "TSR 物件出错，请与巫师联系！\n";

        opened = ob->query("lock/opened");

        if (opened == "" || ! stringp(opened))
               return "只见石门紧闭，上面插着六把火炬（huoju），但都熄灭了！\n";

        if (ob->query("lock/unlocked") && sizeof(opened) == 6)
               return NOR + WHT "\n只见石门陷入地下，六把火炬烧得正旺！一个入口露了出来。\n" NOR;

        msg = HIC "只见石门紧闭，第";
        for (n = 0; n < sizeof(opened); n ++)
        {
              temp = opened[n..n];
              msg += change_num[temp];
              if (n < sizeof(opened) - 1)msg += "、" ;              
        }
        msg += "把火炬燃烧着！\n" NOR;
 
        return msg;

}

