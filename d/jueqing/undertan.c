#include <ansi.h>

inherit ROOM;

string look_kong();
void create()
{
        set("short", "潭底石窟");
        set("long", @LONG
此处是个天然生成的石窟，深不见尽头，顶上有个圆径丈
许的大孔(kong)，日光从孔中透射进来，只是那大孔离地一百
馀丈，石窟深处地底，纵在窟中大声呼叫，上面有人经过也未
必听见。石窟中日光所及处生了不少大枣树(tree)。
LONG);

         set("exits", ([
               "enter" : __DIR__"hole2",
         ]));

         set("item_desc", ([
               "kong" : (: look_kong :),
               "tree" : HIC "\n但见枣树参天耸立，竟有百丈之高。\n" NOR,
         ]));

         set("objects", ([
               CLASS_D("jueqing") + "/chi" : 1,
         ]));     
       
        set("no_clean_up", 0);

        setup();

}

string look_kong()
{
       string msg;
       msg = HIW "\n抬头向头顶透光的洞穴望去，只见那洞离地少说也有一百来丈，"
             "树下虽长着一株大枣树，但不过四五丈高，就算二十株枣树叠起，也到"
             "不了顶，凝思半晌，实是束手无策。\n" NOR;

      return sort_msg(msg); 
}

void init()
{       
        add_action("do_climb", ({ "climb", "pa" }));
}

int do_climb(string arg)
{
        object me = this_player();
        object ob;

        if (! arg || arg != "tree" )
                return notify_fail("你要往哪儿爬？\n");

        if (! ob = find_object(__DIR__"ontree1"))
                ob = load_object(__DIR__"ontree1");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("你还是先把你面前这个家伙解决了再说。\n");

        tell_room(ob, HIC + me->name() + "从下面爬了上来。\n" NOR, me);

        me->move(ob);

        return 1;

}


