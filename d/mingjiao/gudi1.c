#include <ansi.h>;
inherit ROOM;

void create()
{
        set("short", NOR + WHT "大平台" NOR);
        set("long", @LONG
你从上面的悬天崖来到这里，这里前面是一堵屏风也似的大山
壁，眼前茫茫云海，更无去路，你竟是置身在一个三面皆空的极高
平台上。那平台倒有十余丈方圆，可是半天临空，上既不得，下又
不能，当真是死路一条。这大平台上白皑皑的都是冰雪，既无树林，
更无野兽。
LONG );
        set("outdoors", "mingjiao");
        setup();
}

void init()
{
        add_action("do_climb","climb");
}

int do_climb()
{
        int n = this_player()->query_skill("dodge", 1);

        message_vision(HIY "\n$N" HIY "深吸了一口气，慢慢沿"
                       "着雪壁向上爬。\n", this_player());
        if (n > 80)
        {
                this_player()->move(__DIR__"gudi2");
                message_vision(HIR "$N" HIR "爬了半天，手肘"
                        "膝盖都已被坚冰割得鲜血淋漓，终于爬"
                        "了上来。\n\n", this_player());
        } else
        {
                message_vision(HIR "$N" HIR "爬了一会，一不"
                        "小心滑了下来，摔得满身是血。\n" NOR,
                        this_player());
                this_player()->receive_damage("qi", 50);
                this_player()->receive_wound("qi", 30);
        }
        return 1;
}
