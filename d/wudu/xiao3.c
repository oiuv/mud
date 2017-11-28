#include <ansi.h>
inherit ROOM;

string look_pai();

void create()
{
        set("short", "江边小路");
        set("long", @LONG
这里是桃花江边的一条泥土小路，一旁就是清澈的江水。夹岸连
绵不断的桃花灿若云霞，暗香袭人，引来许多蜜蜂在花树间飞舞。前
面有一个木牌 (pai)立在路中央，由于风吹日晒，字迹已经模糊了。
LONG
        );
        set("outdoors", "wudujiao");

        set("exits", ([
                "southeast" : __DIR__"taohua",
                "northwest" : __DIR__"xiao2",
        ]));

        set("item_desc",([
                "pai" : (: look_pai :),

        ]));
   

        setup();
}

string look_pai()
{
    return
    "\n"
              WHT "          ################################\n"
                  "          ##                            ##\n"
                  "          ##          通     告         ##\n"
                  "          ##                            ##\n"
                  "          ##        前方乃桃花峪……    ##\n"
                  "          ##    内…瘴气…危险。本村    ##\n"
                  "          ##    之人…严禁…闯入。      ##\n"
                  "          ##                            ##\n"
                  "          ##            村长  苗三斤    ##\n"
                  "          ##                            ##\n"
                  "          ################################\n\n" NOR
    "\n";
}
