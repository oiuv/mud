#include <ansi.h>

inherit ROOM;

string look_zi();
int tell_player();

void create()
{
        set("short", "断肠崖");
        set("long", @LONG
到得此处只见崖壁上刻了“断肠崖”三字，自此而上，数
十丈光溜溜的寸草不生，终年云雾环绕，天风猛烈，便飞鸟也
甚难在峰顶停足。山崖下临深渊，自渊口下望，黑黝黝的深不
见底。“断肠崖”前后风景清幽，只因地势实在太险，山石滑
溜溜，极易掉入深渊崖，俯视深谷，但见灰雾茫茫四下里山石
嶙峋，树木茂密。隐约可见崖壁上用利器刻着两行字(zi)。抬
头见一座山峰冲天而起，正是绝险之地的绝情峰。
LONG);
        set("outdoors", "jueqing");
        set("item_desc",([
                "zi" : (: look_zi :),
        ]));
        set("exits", ([
               "southdown" : __DIR__"shanlu5",
               "east"      : __DIR__"shulin2",
               "north"     : __DIR__"shanlu7",
        ]));

        set("no_clean_up", 0);

        setup();
}

void init()
{       
        add_action("do_jump", ({ "tiao", "jump" }));
}

int do_jump(string arg)
{
        object me = this_player();

        if (! arg || (arg != "ya" && arg != "down" ))
                return notify_fail("你要做什么？\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("你还是先把你面前这个家伙解决了再说。\n"); 
        
        if (! me->query_temp("marks/跳"))
        {
                write(HIR "你真的要跳下" HIW "断肠崖" HIR "吗，如果确定"
                      "再执行一次该指令。\n" NOR);

                me->set_temp("marks/跳", 1);

                return 1;
        }

        write(HIG "\n你鼓起勇气，纵身一跃跳下" HIW "断肠崖" HIG "…\n" NOR);   
        write(HIR "\n你只觉得耳边风声萧萧，浑身使不处半点力气，一颗心都提到\n"
              "了喉咙上。但见万千景致飞快地向上飞去，而感觉自己却越落\n越快"
              "，想不到这断肠崖竟如此之高。\n" NOR);

        remove_call_out("tell_player");
        call_out("tell_player", random(6) + 6);

        return 1;
}

string look_zi()
{
        return
        HIC "\n"
        "\t※※※※※※※        ※※※※※※※\n"
        "\t※※※※※※※        ※※※※※※※\n"
        "\t※※      ※※        ※※      ※※\n"
        "\t※※" NOR + HIR "　十　" HIC "※※        ※※" NOR + HIR "  夫  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" NOR + HIR "　六　" HIC "※※        ※※" NOR + HIR "  妻  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" NOR + HIR "　年　" HIC "※※        ※※" NOR + HIR "  情  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" NOR + HIR "　后　" HIC "※※        ※※" NOR + HIR "  深  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" HIR "　在　" HIC "※※        ※※" HIR "  莫  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" HIR "　此　" HIC "※※        ※※" HIR "  失  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" HIR "　相　" HIC "※※        ※※" HIR "  信  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" HIR "　聚　" HIC "※※        ※※" HIR "  约  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n" 
        "\t※※※※※※※        ※※※※※※※\n"
        "\t※※※※※※※        ※※※※※※※\n\n" NOR;
}

int tell_player()
{  
       object me = this_player();
       object ob;
     
       if (! ob = find_object(__DIR__"underya"))
               ob = load_object(__DIR__"underya");

       tell_object(me, HIY "\n猛然间你看见下面竟有一个深潭，眼看快要落入潭中，你屏住\n"
                           "呼吸闭住双目，只听“扑咚”一声，你顿感潭水冰冷刺骨，你\n"
                           "猛地向岸边挣扎而去，终于达到了岸边，但此时你只觉得全身\n"
                           "麻木，体力不知，眼前一片模糊…\n" NOR);
       me->move(ob);
       me->delete_temp("marks/跳");
       me->unconcious();

       return 1;
}
