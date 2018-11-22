// xuxiake.c 徐霞客

#include <ansi.h>
inherit NPC;

mixed ask_map();

void create()
{
        set_name("徐霞客", ({ "xu xiake", "xu", "xiake" }));
        set("long", @LONG
他早年走遍天下，见识了无数的美景奇观，对
山川地理莫不了如指掌。
LONG);
        set("gender", "男性");
        set("age", 45);
        set("attitude", "friendly");
        set("inquiry", ([
                "地图" : (: ask_map :),
                "map"  : (: ask_map :),
        ]));
        setup();
        carry_object("/clone/misc/cloth")->wear();
}

mixed ask_map()
{
        object me, ob;
        mapping map;
        string *ks;
        string msg;
        string str;
        int n;

        ob = this_object();
        me = this_player();

        if (! me->query("out_family"))
                return "你身上带了地图册了么？";

        if (me->query("map_all"))
                return "你的地图册已收录全集了，不如到处多走走吧。";

        if (! mapp(map = me->query("map")))
                return "哦？你这本地图册还全是白纸呢。";

        // 查看那些地方没有绘制
        ks = (string *) MAP_D->query_all_map_zone() - keys(map);

        if (sizeof(ks) < 1)
        {
                n = 0;
                foreach (str in keys(map))
                        n += sizeof(map[str]);

                if (n < 750)
                {
                        message_sort(HIW "$N" HIW "接过$n" HIW "的地图册，仔细"
                                     "翻了一会儿，叹道：我看过你绘制的地图册了"
                                     "，收录地点倒是满全的，可惜很多地方记载不"
                                     "祥，你自己好好再看看吧。\n" NOR, ob, me);
                        return 1;
                }

                message_sort(HIW "$N" HIW "接过$n" HIW "的地图册，仔细翻了一会"
                             "儿，凝思良久，又翻阅了一阵，不由得喜上眉梢，对$n"
                             HIW "赞道：“实在不曾想到这世上还有人能像我一样走"
                             "遍名山大川，难得，难得。嗯，我看你的地图册中还有"
                             "少许缺漏，这就给你补全吧，日后你或许还用得上。”"
                             "说完，$N" HIW "随手拿起笔，在$n" HIW "的地图册上"
                             "补了几笔，还给了$n" HIW "。\n" NOR, ob, me);

                me->delete("map");
                me->set("map_all", 1);

                CHANNEL_D->do_channel(this_object(), "rumor", "听说" +
                                      me->name(1) + HIM + "(" + me->query("id") +
                                      ")向徐霞客讨教地理山川知识，获得"
                                      "了地图全集。" NOR);

                me->add("potential", 50000);
                me->add("score", 5000);			//2015年4月4日 17:23:21奖励+2K
                tell_object(me, HIG "\n你仔细翻阅了地图全集，思索许久，收获良"
                                "多。\n通过此次经历，你获得了九万五千点潜能和"
                                "五千点江湖阅历。\n" NOR);
                return 1;
        }

        if (sizeof(ks) > 3) ks = ks[0..2];
        ks = map_array(ks, (: MAP_D->query_map_short($1) :));

        msg = HIC "$N" HIC "接过$n" HIC "的地图册，仔细翻"
              "了一会儿，皱眉道：以我看来，你这里面绘制的"
              "地图还相当不全呢，至少" + implode(ks, "、") +
              HIC "就没有收录在内。\n" NOR;

        message_sort(msg, ob, me);
        return 1;
}
