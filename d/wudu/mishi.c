#include <ansi.h> 
inherit ROOM;

void create()
{
        set("short", "密室");
        set("long", @LONG
这里是一座不大的石室，房间落满灰尘，好象有多年没人打扫似
的。室内只有一床一案，一缕阳光从洞顶的岩缝中射入，照射在室壁
上，你发现石壁(wall)上似乎有一些花纹。室内光线明亮。墙边有一
个青石床，一个宽大的石案上摆着一个石匣(xia)。
LONG
        );
        set("sleep_room", 1);
        set("no_fight", 1);

        set("exits", ([
                "eastup" : __DIR__"shixi",
        ]));
        set("item_desc",([
                "xia": WHT "\n一只石匣，好象是和石案连在一起的，不"
                       "知道敢不敢打开看看。\n " NOR,
                "wall": WHT "\n墙上刻着很多蝇头小字，还附着一些图画，"
                       "似乎是一门极上乘的武学。\n " NOR,
        ]));

        set("mishi_book", 1);
        setup();
}

void init()
{
        add_action("do_think", "think");
        add_action("do_open", "open");
}

int do_open(string arg)
{
        object me, ob;
        me = this_player();

        if( !arg || arg != "xia")
                return 0;

        if( query("mishi_book") == 1 && me->query("can_learn/qianzhu-wandushou") )
        {
                message_vision(HIC "$P" HIC "打开石匣，发现内有一束绢"
                               "册，连忙取了出来。\n" NOR, me);
                add("mishi_book", -1);
                ob = new(__DIR__"obj/qianzhumiji");
                ob->move(me);
        } else
                return notify_fail("\n你打开石匣，但见里面空空如也。\n");

        return 1;
}
int do_think(string arg)
{
        object ob;
        int c_exp, c_skill;
        ob = this_player();

        if (arg != "wall") return 0;

        c_skill = (int)ob->query_skill("qianzhu-wandushou", 1);
        c_exp = ob->query("combat_exp");

        if ( !ob->query("can_learn/qianzhu-wandushou"))
        {
                message_vision(HIR "$N" HIR "仔细端详了石壁半天，还是无法看懂上面的内容。\n" NOR, ob);
                return 1; 
        }

        if (ob->query("character") == "光明磊落")
        {
                tell_object(ob, HIY "你心中暗想：我为人光明磊落，岂能学习这种害人武功？\n" NOR);
                return 1; 
        }

        if (ob->query("character") == "狡黠多变")
        {
                tell_object(ob, HIY "你心中暗想：哼，这种武功虽然厉害，但对自身损害极大，学来何用？\n" NOR);
                return 1; 
        }

        if (ob->query("jing") < 50)
        {
                message_vision(HIR "$N" HIR "现在太累了，无法研读石壁的内容。\n" NOR, ob);
                return 1; 
        }

        if (c_skill > 119)
        {
                message_vision(WHT "$N" WHT "觉得石壁内容太肤浅了。\n" NOR, ob);
                return 1; 
        }

        if ((c_skill * c_skill * c_skill / 10) > c_exp)
        {
                message_vision(HIR "$N" HIR "的实战经验不足，无法领悟石壁内容。\n" NOR, ob);
                return 1; 
        }

        message_vision(HIY "$N" HIY "面对着石壁静思良久，对千蛛万毒手似有所悟。\n" NOR, ob);
        ob->improve_skill("qianzhu-wandushou", random(30 * ob->query("int")));
        ob->receive_damage("jing", 15);
        return 1;
}
