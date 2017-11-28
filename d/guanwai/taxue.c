// /guanwai/taxue.c

#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "踏雪院");
        set("long", @LONG
这是一条碎石子铺的小路，西面烟雾缭绕的，墙壁都有些发黑了，
看上去有些刺眼，不过里面却飘来阵阵香气，看来是厨房。东面则是
一个显得有些荒凉的小院子，似乎没什么东西。时不时有一些胡家的
弟子匆匆而过。
LONG );
        set("exits", ([
                "west"  : __DIR__"shizilu",
        ]));

        set("outdoor", "guanwai");
        setup();
}

void init()
{
        add_action("do_amble", "amble");
}

int is_valid()
{
        int m = NATURE_D->query_month();

        return (m >= 10 || m <= 2);
}

string long()
{
        string msg;

        if (is_valid())
                msg = "看到这一地的积雪，你不由得感觉到阵阵寒意。入冬"
                      "以来老天爷落下层层的积雪，从来没有人打扫，以至"
                      "于地上积雪足足有上尺之深。时不时有一些胡家的弟"
                      "子慢悠悠的飘然踏雪(amble) 从院子这头迈到那一头"
                      "，有的留下一些脚印，也有人走过没留半点足迹，令"
                      "人叹羡。\n";
        else
                msg = "院子铺了一地的碎石子，显得有些荒凉。角落里靠着"
                      "一块木牌子，上面写着：" HIW "踏雪无痕，也亦不难  胡一"
                      "刀" NOR "。字写的虽然潦草拙劣，却也显得颇有力道，与众"
                      "不同。\n";

        return sort_string(msg, 60, 4);
}

int do_amble()
{
        object me;
        int lvl;

        me = this_player();

        if (me->is_busy())
                return notify_fail("你现在忙着呢。\n");

        if (me->is_fighting())
                return notify_fail("你正忙着打架呢。\n");

        me->start_busy(2 + random(3));
        if (! is_valid())
        {
                write("你在院子里面慢慢的溜达了一圈，满惬意，就是太无聊了。\n");
                return 1;
        }

        if (me->query("neili") < 100)
        {
                write("你看了看满院的积雪，提了一口真气，忽然觉得内力有些不济。\n");
                return 1;
        }

        me->add("neili", -50 - random(50));
        write("你深吸一口气，脚点积雪，轻飘飘的迈开步去。\n");
        lvl = me->query_skill("sixiang-bufa", 1);
        if (lvl < 50)
        {
                message_vision("$N晃晃悠悠的走了两步，“噗”的一下脚深深的"
                               "陷入了雪中，一脸懊丧之色。\n", me);
                return 1;
        } else
        if (lvl < 100)
        {
                message_vision("$N勉勉强强的绕着院子走了一圈，留了一地深浅"
                               "不一的脚印，惹得众人大笑。\n", me);
                return 1;
        }

        switch (random(3))
        {
        case 0:
                message_vision("$N哈哈一笑，双足连环踏雪而走，身"
                               "形飘洒之极！\n", me);
                break;

        case 1:
                message_vision("$N脸色木然，只是不住的凝神前行，"
                               "背后几乎没有留下半点脚印。\n", me);
                break;

        default:
                message_vision("$N迈开大步，一步步的走了出去，不"
                               "一会儿便走了一圈，自顾坐下冥神思索。\n", me);
                break;
        }

        if (me->can_improve_skill("dodge"))
                me->improve_skill("dodge", lvl / 2 + random(lvl / 2));

        if (me->can_improve_skill("sixiang-bufa"))
                me->improve_skill("sixiang-bufa", lvl / 2 + random(lvl / 2));
        return 1;
}
