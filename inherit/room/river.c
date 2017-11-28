// river.c
// by vin

#include <room.h>
#include <ansi.h>

inherit ROOM;

void setup()
{
        set("item_desc/river", HIC "\n只见近岸处有一叶小舟，也许大声喊("
                               HIY "yell" HIC ")一声船家(" HIY "boat" HIC
                               ")就\n能听见。倘若你自负轻功绝佳,也可直接"
                               "渡水(" HIY "cross" HIC ")踏江而过。\n" NOR);
        ::setup();
}

void init()
{
        add_action("do_yell", "yell");
        add_action("do_cross", "cross");
}

int do_yell(string arg)
{
        object *obs;
        object me, arrive, boat;
        string msg;

        me = this_player();
        arrive = find_object(query("arrive_room"));

        if (! arrive)
                arrive = load_object(query("arrive_room"));

        if (! arg || arg == "" )
                return 0;

        if (strlen(arg) > 15)
                return notify_fail("你清了清嗓子，发现自己似乎无法"
                                   "吼出那么长一段话。\n");

        if (arg == "boat")
                arg = "船家";

        msg = WHT "\n$N" NOR + WHT "鼓足中气，高喊一声：「" +
              arg + "」声音远远传了出去。\n" NOR;

        if (arg != "船家" || ! arrive)
        {
                msg += HIY "突然江面上远远传来一阵回声：「" +
                       arg + "～～～」\n" NOR;
                message_vision(msg, me);
        } else
        {
                msg += HIY "\n只见一叶扁舟缓缓地驶了过来，艄公随手"
                       "将一块踏脚板搭上堤岸，以便乘客上下。$N" HIY
                       "见后赶忙快步踏上。艄公待$P上船后随即便将踏"
                       "脚板收起来，竹篙一点向江心驶去。\n\n" NOR;
                message_sort(msg, me);

                boat = new("/clone/misc/river_boat");

                obs = filter_array(all_inventory(), (: $1 == $(me)
                                   || $1->query_leader() == $(me)
                                   && ! playerp($1)
                                   && ! $1->is_killing($(me)->query("id")) :));
                obs->move(boat);

                me->start_call_out((: call_other, __FILE__, "arrival",
                                      //me, boat, arrive :), 10);
                                      me, boat, arrive :), 3);
        }
        return 1;
}

void arrival(object me, object boat, object arrive)
{
        object *obs;

        if (! objectp(me) || ! objectp(boat))
                return;

        if (environment(me) != boat)
                return;

        obs = filter_array(all_inventory(boat), (: $1 == $(me) 
                           || $1->query_leader() == $(me)
                           && ! playerp($1)
                           && ! $1->is_killing($(me)->query("id")) :));

        tell_object(me, CYN "\n艄公说道：「到啦，上岸吧。」随即把"
                        "一块踏脚板搭上堤岸。\n\n" NOR);

        obs->move(arrive);
        message("vision", HIY "\n只见一艘小船缓缓向岸边靠近，还未"
                          "泊稳，便有人急急跳了下来。\n\n" NOR,
                          environment(me), ({ me }));

        if (sizeof(obs = all_inventory(boat)) > 0)
        {
                message("vision", WHT "只听扑通扑通几声，从渡船上"
                                  "扔下一堆东西来。\n" NOR, me);
                obs->move(arrive);
        }

        if (objectp(boat))
                destruct(boat);
}

int do_cross()
{
        object me, arrive;
        string msg;

        me = this_player();
        arrive = find_object(query("arrive_room"));

        if (! arrive)
                arrive = load_object(query("arrive_room"));

        if (! arrive)
        {
                tell_object(me, "你举目望去，发现水面雾气极浓，什"
                                "么都看不清。\n");
                return 1;
        }

        if (! me->query_skill("dodge", 1))
        {
                tell_object(me, "你大眼一瞪？干什么，跳河自杀么？\n");
                return 1;
        }

        if (me->query_skill("dodge") < 270)
        {
                tell_object(me, "你掂量了一下，觉得自己的轻功似乎"
                                "还没练到家。\n");
                return 1;
        }

        if (me->query("neili") < 300)
        {
                tell_object(me, "你的内力不够，还是先休息一下吧。\n");
                return 1;
        }

        me->add("neili", -200);

        msg = HIW "\n只见$N" HIW "身形微微一晃，已然飘出丈许，以"
              "足尖轻点水面向对岸踏波掠去，漾起层层微澜。身形洋洋"
              "洒洒，若彩蝶飞扬，甚是逍遥。便在众人惊叹轻功绝妙间"
              "，早已没了踪影。\n\n" NOR;
        message_sort(msg, me);

        me->move(arrive);
        message("vision", HIW "\n忽见水面上雾气散开，一人踏波"
                          "逐浪，竟大踏步掠过江来！\n\n" NOR,
                          environment(me), ({ me }));
        return 1;
}
