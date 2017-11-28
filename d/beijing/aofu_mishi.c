#include <ansi.h>
inherit ROOM;

#define BISHOU  "/clone/lonely/bishou"
#define BAOJIA  "/clone/lonely/baojia"

void create()
{
        object ob1, ob2;

        ob1 = find_object(BISHOU);
        if (! ob1) ob1 = load_object(BISHOU);

        ob2 = find_object(BAOJIA);
        if (! ob2) ob2 = load_object(BAOJIA);

        set("short","鳌府密室");
        set("long", @LONG
这里是鳌拜府的密室，但是这里似乎也没有珍藏什么特别
的宝贝。周围黑漆漆的，颇为阴森恐怖。
LONG);
        set("exits", ([
                "up" :  __DIR__"aofu_shufang",
        ]));
        set("objects", ([
        ]));

        if (! environment(ob1))
               ob1->move(this_object());

        if (! environment(ob2))
               ob2->move(this_object());

        setup();
        replace_program(ROOM);
}
