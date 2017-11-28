// changan: prison.c
// by Doing

#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", HIR "大牢" NOR);
        set("long", @LONG
这里黑乎乎的，地上的茅草也是湿漉漉的，让你感到极不舒服，想
起在监外自由自在的日子，你心里真是万分难过。
    旁边有一个牌子(paizi)。
LONG );
        set("no_fight", 1);
        set("item_desc", ([
                "paizi" : "越狱者罪加一等。\n"
        ]));
}

void catch_back(object me)
{
        message_vision(HIM "忽然几个捕快赶了过来，团团围住$N"
                       HIM "就是一顿痛殴，边打边骂道：“好家"
                       "伙！我让你跑...”\n\n" NOR, me);

        message("vision", HIY "这群捕快把" + me->name() +
                HIY "打得昏死过去，然后套上枷锁押走了。\n\n" NOR,
                environment(me), ({ me }));
}

void catch_ob(object me)
{
        message_vision(HIM "忽然张召重赶了过来，一把抓住$N，用铁链锁住，恶狠"
                       "狠的叫道：“站住！你犯案了，快跟我走吧！”\n\n" NOR,
                       me);

        message("vision", HIY "张召重三拳两脚把" + me->name() +
                "打晕拎走了。\n\n" NOR,
                environment(me), ({ me }));
}

int free_ob(object me)
{
        string startroom;
        message_vision("两个狱卒从门外走了出来，架起$N，道：好了，你可以"
                       "走了，要是再敢犯案，哼哼...\n\n", me);
        message("vision", "两个狱卒和" + me->name() +
                "走了出去... 你不禁叹了一口气。\n",
                environment(me), ({ me }));

        tell_object(me, HIR "你被两个狱卒架着走了出大牢...\n\n" NOR);

        if (me->is_ghost())
                startroom = "/d/death/gate";
        else
                startroom = "/d/changan/baihu1";

        me->set("startroom", startroom);
        me->move(startroom);
        message("vision", "两个狱卒架着一脸憔悴的" + me->name() +
                          "走了出来，打开枷锁，哼了一声就回去了。\n",
                          environment(me), ({ me }));
	return 1;
}

