#include <ansi.h> 

inherit ROOM;

void create()
{
        set("short", HIR "拇指峰" NOR);
        set("long", @LONG
拇指峰是铁掌五峰中最为低矮的一峰，名为峰，实则只是一座较高的石
山罢了。峰顶四周全是又大又圆的岩石，在日晒雨淋下，被风蚀得十分之光
滑。在岩石的缝隙中，长出许多松树，其中一棵尤其引人注目。相传这棵松
名曰——并蒂松(song)，乃同根而生，于距地一米高处，忽分为二。这两根
树干同粗同高，均长得高大挺拔，枝叶茂盛，尤如兄弟一般，因此又名为兄
弟松。
LONG    );
        set("exits", ([
                "southdown" : __DIR__"sslu-3",
        ]));

        set("item_desc", ([ 
                "song" : GRN "\n这棵松树能长得如此奇特，必蕴涵了天地日月之精华。\n" NOR,
        ]));

        set("no_clean_up", 0);
        setup();
}

void init()
{
        add_action("do_caiqi", "caiqi");
}

int do_caiqi(string arg)
{
//      mapping fam;
        object me;
        me = this_player();

        if ( ! living(me)) return 0;
        if ( ! living(this_player()) || arg != "song" )
        {
                message_vision("你想干什么？\n",me);
                return 1;
        }

        if( me->is_busy() )
                return notify_fail("你现在正忙着呢。\n");

        if ((int)me->query_skill("force",1) > 100)
                return notify_fail("依照你的内功修为已经再无法从树中吸取任何东西了！\n");

        if ((int)me->query_skill("force", 1) < 30 )
                return notify_fail("你的内功修为太低了，没办法从树中采气！\n");

        if (! me->can_improve_skill("force"))
                return notify_fail("你的实战经验不够，无法再加深你的内功！\n");

        if((int)me->query("jing") < 40)
        {
                write("你忽然觉得精神不济，无法控制体内的真气！\n");
                return 1;
        }

        me->receive_damage("jing", 30);
        message_vision(HIW "$N" HIW "闭上双眼，双手紧紧地贴住树干，开始缓缓吐呐练功。\n" NOR, me);
        me->improve_skill("force", me->query("con") * 2 / 3);
        me->start_busy(random(2));
        return 1;
}