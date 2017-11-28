#include <ansi.h> 

inherit ROOM;

void create()
{
        set("short", WHT "石室" NOR);
        set("long", @LONG
这是一间在山腹中凿成的小石屋，中间有一座石桌 (shizhuo)，桌上摆
放着一盏油灯，散发出暗淡昏黄的光亮。屋内光线很暗，四周还散发着一股
腐烂霉臭的味道。
LONG );

        set("exits", ([
                "eastup" : __DIR__"shijie-3",
        ]));

        set("item_desc",([
                "shizhuo": WHT "\n一座石桌，桌身好象是和石屋连在一起的，上面重重的印着两个手印。\n " NOR,
                "shouyin": WHT "\n一双在石桌上的手印，你可以试着把双手嵌(qian)进去。\n " NOR,
        ]));

        set("mishi_book", 1);
        setup();
}

void init()
{
        add_action("do_qian", "qian");
}

int do_qian(string arg)
{
        object me, ob;
        me = this_player();

        if ( ! arg || arg != "shouyin")
                return notify_fail("你要干什么？\n");

        if ((int)me->query_skill("tie-zhang", 1) < 50 )
        {
                message_vision(HIY "$N" HIY "将双手嵌在石桌的手印上，结果什么都没有发生。\n" NOR, me);
                return 1; 
        }

        if( query("mishi_book") == 1 )
        {
                message_vision(HIR "$N" HIR "将双手嵌在石桌的手印上，只听「轰隆隆」一阵闷响，石桌下豁"
                               "然有一本书籍。\n" NOR + HIC "$N" HIC "见状大喜，立忙将其拣了起来。\n"
                               NOR, me);
                add("mishi_book", -1);
                ob = new(__DIR__"obj/zhangpu");
                ob->move(me);
        } else
                return notify_fail(HIR "\n你将双手嵌在石桌的手印上，只听「轰隆隆」一阵闷响，石桌"
                                   "移开，可是下面什么也没有。\n" NOR);

        return 1;
}