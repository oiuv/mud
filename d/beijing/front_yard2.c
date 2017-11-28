#include <ansi.h> 
inherit ROOM;

void create ()
{
  	set ("short", "练武场");
  	set ("long", @LONG
空阔的场地上铺满了细细的黄土，正好适合演武。四面有几个镖局的镖师
正在练武。练武场的中心竖着几根木桩(muzhuang)，木桩周围还挖了若干个大
沙坑 (shakeng)。西面是一间厢房，镖局的客人可以去休息。场地东边有个兵
器架。
LONG);

  	set("item_desc", ([
  		"shakeng"  : WHT "沙坑里有些家将在练习轻功，你也可"
                             "以跳(tiao)下去试试。\n" NOR,
  		"muzhuang" : WHT "几根木桩上有不少击打(jida)过的痕"
                             "迹。\n" NOR,
	]));

  	set("exits", ([
  		"north" : __DIR__"zhengting.c",
  		"west" : __DIR__"bedroom",
  		"south" : __DIR__"front_yard",
  		"east" : __DIR__"bingqi",
	]));

  	set("objects", ([
               CLASS_D("zhenyuan") + "/daiyongming" : 1,
        ]));

  	setup();
}

void init()
{
  	add_action("do_jida", "jida");
  	add_action("do_tiao", "tiao");
}

int do_jida(string arg)
{
        object me;
        object weapon;
        me = this_player();

        if (! living(me) || arg != "muzhuang")
                return notify_fail("你要击打什么？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        if (objectp(weapon = me->query_temp("weapon")))
                return notify_fail("你操起手中兵器向木桩砍去，砍了半天发现毫无成效。\n");

        if ((int)me->query_skill("bagua-quan", 1) < 30
           || (int)me->query_skill("bagua-zhang", 1) < 30)
                return notify_fail("你击打了半天，似乎没什么效果，可能是八卦拳掌等级太"
                                   "低的缘故。\n");

        if ((int)me->query_skill("bagua-quan", 1) >= 120
           && (int)me->query_skill("bagua-zhang", 1) >= 120)
                return notify_fail("你对着木桩击打了一会儿，发现这里已经不能再提高什么"
                                   "了。\n");

        if ((int)me->query("qi") < 40)
                return notify_fail("你现在累得胳膊都抬不起来了，还是先休息一会儿吧！\n");

        me->receive_damage("qi", 30);

        if (me->can_improve_skill("bagua-zhang")
           && (int)me->query_skill("bagua-zhang", 1) < 120)
                me->improve_skill("bagua-zhang", me->query("con") * 2);

        if (me->can_improve_skill("bagua-quan")
           && (int)me->query_skill("bagua-quan", 1) < 120)
                me->improve_skill("bagua-quan", me->query("con") * 2);

        me->start_busy(random(2));
        message_vision(WHT "\n$N" WHT "站稳马步，一掌一拳对着木桩打了起来。\n" NOR, me);
        write(HIC "你在击打过程中领悟了不少「八卦拳法」及「八卦掌法」的窍门。\n" NOR);
        return 1;
}

int do_tiao(string arg)
{
        object me;
        //object weapon;
        me = this_player();

        if (! living(me) || arg != "shakeng")
                return notify_fail("你要击打什么？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        if ((int)me->query_skill("dodge", 1) < 30
           || (int)me->query_skill("bagua-bu", 1) < 30)
                return notify_fail("你憋足气朝着沙坑跳去，结果一跤重重地摔在了坑中。\n");

        if ((int)me->query_skill("dodge", 1) >= 120
           && (int)me->query_skill("bagua-bu", 1) >= 120)
                return notify_fail("你在沙坑周围跳了一会儿，发现在这里练习已经没什么用了。\n");

        if ((int)me->query("qi") < 40)
                return notify_fail("你现在累得脚都抬不起来了，还是先休息一会儿吧！\n");

        me->receive_damage("qi", 30);

        if (me->can_improve_skill("dodge")
           && (int)me->query_skill("dodge", 1) < 120)
                me->improve_skill("dodge", me->query("con") * 2);

        if (me->can_improve_skill("bagua-bu")
           && (int)me->query_skill("bagua-bu", 1) < 120)
                me->improve_skill("bagua-bu", me->query("con") * 2);

        me->start_busy(random(2));
        message_vision(WHT "\n$N" WHT "深吸一口气，“飕”的一声跳过了沙坑，接着翻身一纵"
                       "又跳了回来。\n" NOR, me);
        write(HIC "你对「八卦步法」及「基本轻功」有了新的理解。\n" NOR);
        return 1;
}
