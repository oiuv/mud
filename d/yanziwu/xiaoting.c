// Room: xiaoting

#include <ansi.h>
inherit ROOM;

void init();
int do_tap(string);
int do_sit(string);
void delete_served(object);

void create()
{
        set("short", "晓寒厅");
        set("long", @LONG
这是一间小厅,厅虽不大,布置倒也别致。满厅的芳香，沁
人心脾。只见墙上挂着几幅条幅,笔致颇为潇洒,但掩不住几分
柔弱之气。厅内四周精巧地摆着些桌子(table)和椅子(chair)。
LONG );
        set("exits", ([
            "west" : __DIR__"qinyun",
            "east" : __DIR__"cuixia",
            "north" : __DIR__"xiaojing",
            "south" : __DIR__"chufang",
        ]));

        set("item_desc", ([
            "table" : "一张典雅的桃木小桌，上面放着水果盘和饮茶器具。\n",
            "chair" : "一只青竹打制的靠椅，躺上去摇摇晃晃，好舒服耶！\n",
        ]));

        set("objects",([
              __DIR__"npc/susu" : 1,
              __DIR__"obj/gao" : 2,
              __DIR__"obj/cha" : 1,
        ]));
        setup();
}

void init()
{
        add_action("do_tap", "tap");
        add_action("do_tap", "knock");
        add_action("do_sit", "sit");
}

int do_tap(string arg)
{

        object me;
        object susu;

        if (arg != "desk" && arg != "table")
                return notify_fail("你要敲什么？\n");

        me = this_player();
        if (! objectp(susu = present("su su", environment(me))))
                return notify_fail("你敲了敲桌子，却还是没人理你。你突然"
                                   "感觉自己很无聊。\n");

        if (! me->query_temp("marks/sit"))
                return notify_fail("你敲了敲桌子，却发现素素看着你直笑，"
                                   "你突然感觉自己很愚蠢。\n");

        if (susu->query_temp("marks/served"))
        {
            message_vision("素素不耐烦地对$N说道：我这里忙着呢！\n", me);
            return 1;
        }

        message_vision("$N端坐在桌前，轻轻扣了下桌面，素素一笑，过来招呼。\n", me);

        susu->serve_tea(me);

        susu->set_temp("marks/served", 1);
        call_out("delete_served", 5, susu);

        return 1;
}


void delete_served(object me)
{
        if (objectp(me))
                me->delete_temp("marks/served");
}


int do_sit(string arg)
{

        if (arg != "chair")
                return notify_fail("你要坐什么上面？\n");

        if (this_player()->query_temp("marks/sit"))
                return notify_fail("你已经有了个座位了。\n");

        this_player()->set_temp("marks/sit", 1);
        write("你找了个空位座下，等着上茶。\n");
        return 1;
}


int valid_leave(object me,string dir)
{
        me->delete_temp("marks/sit");
        me->delete_temp("tea_cup");
        return::valid_leave(me,dir);
}

