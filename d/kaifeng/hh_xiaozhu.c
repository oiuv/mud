#include <ansi.h> 
inherit ROOM;

void create()
{
        set("short", "花园小筑");
        set("long", @LONG
这里是红花会总舵后花园中的一间凉亭，凉亭造得颇为精
致，中间横着一张石桌，看起来比较特别，似乎有移动过的痕
迹。桌上刻着横十九，纵十九的一张棋盘，残局还未撤去。清
晨来这里读书，夕阳西下时品茗谈天，当是人生一大快事。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"southdown" : __DIR__"hh_road",
	]));
        set("objects", ([
                CLASS_D("honghua") + "/yu" : 1,
        ]));
        set("item_desc",([
                "zhuo": WHT "\n一张古旧的青石桌案，不知能不能移开。\n " NOR,
        ]));

        set("outdoors", "honghua");
        setup();
}

void init()
{
        add_action("do_move", "move");
}

int do_move(string arg)
{
        //int n;
        object me = this_player();

        if (! arg || arg != "zhuo")
                return 0;

        if (query("exits/down"))
                return notify_fail("石桌已经被移开了，你还移它作甚？\n");

        if (me->query("family/family_name") != "红花会" &&
           objectp(present("yu yutong", environment(me))))
        {
                        write(CYN "余鱼同眉头一皱，喝道：阁下什么来"
                              "头，居然敢在这里猖狂？\n" NOR);
                        return 1;
        }

        message_vision(HIY "$N" HIY "走到石桌前，运力双掌，使劲推动"
                       "石桌，打算将它移开。\n" NOR, me);

        if (me->query("max_neili") < 1000)
        {
               message_vision(HIR "结果哪知$N" HIR "内力不济，连吃奶"
                              "的劲都用上了，石桌还是纹丝不动。\n" NOR, me);
               me->set("neili", 0);
               return 1;
        }

        message_vision(HIY "石桌忽然发出轧轧的声音，向一侧缓缓移开，"
                        "向下露出一个黑洞洞的入口。\n" NOR, me);

        set("exits/down", __DIR__"hh_mishi");
        me->set("neili", 0);
        remove_call_out("close_passage");
        call_out("close_passage", 10);
        return 1;
}

void close_passage()
{
        //object room;

        if (! query("exits/down")) return;
        message("vision", HIY "\n石桌发出隆隆的声音，缓缓移回原处。\n" NOR,
                          this_object());
        delete("exits/down");
}

int valid_leave(object me, string dir)
{
        object yu;

        if (dir != "down"  ||
            ! objectp(yu = present("yu yutong", this_object())))
                return ::valid_leave(me, dir);

        return yu->permit_pass(me, dir);
}