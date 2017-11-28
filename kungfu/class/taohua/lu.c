#include <ansi.h>
#include "taohua.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();
mixed ask_skill2();

void create()
{
        set_name( "陆乘风" ,({ "lu chengfeng", "lu", "chengfeng" }));
        set("gender", "男性");
        set("nickname", HIC "归云庄主" NOR);
        set("age", 52);
        set("long", "陆乘风是黄药师的第四个徒弟。他的鬓角已微见白发，但\n"
                    "身材魁梧，双眼有神。\n");
        set("attitude", "friendly");
        set("class", "scholar");
        set("str", 24);
        set("int", 30);
        set("con", 25);
        set("dex", 21);

        set("max_qi", 4500);
        set("max_jing", 2500);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 120);
        set("combat_exp", 1000000);

        set_skill("force", 200);
        set_skill("luoying-xinfa", 200);
        set_skill("unarmed", 200);
        set_skill("xuanfeng-tui", 200);
        set_skill("strike", 200);
        set_skill("pikong-zhang", 200);
        set_skill("finger", 180);
        set_skill("canglang-zhi", 180);
        set_skill("dodge", 180);
        set_skill("parry", 180);
        set_skill("sword", 200);
        set_skill("luoying-shenjian", 200);
        set_skill("literate", 180);
        set_skill("qimen-wuxing", 160);
        set_skill("calligraphy", 160);
        set_skill("martial-cognize", 160);

        map_skill("force", "luoying-xinfa");
        map_skill("unarmed", "xuanfeng-tui");
        map_skill("strike", "pikong-zhang");
        map_skill("finger", "canglang-zhi");
        map_skill("dodge", "xuanfeng-tui");
        map_skill("parry", "luoying-shenjian");
        map_skill("sword", "luoying-shenjian");

        prepare_skill("unarmed", "xuanfeng-tui");
        prepare_skill("strike", "pikong-zhang");

        create_family("桃花岛", 2, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.sui" :),
                (: perform_action, "finger.tao" :),
                (: perform_action, "strike.dai" :),
                (: perform_action, "unarmed.kuang" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }));

        set("inquiry", ([
                "东邪" : "家师人称东邪！呵呵。",
                "西毒" : "欧阳锋是与家师并世齐名的高手，人称老毒物。",
                "南帝" : "听家师说段王爷现在出家当了和尚，法名一灯。",
                "北丐" : "北丐洪七公是丐帮帮主，现在扬州城外。",
                "黄蓉" : "她是师父的爱女。",
                "黄药师" : "你要拜访家师？",
                "桃花岛" : "这儿就是桃花岛，你若不是本派弟子，要过桃花阵。",
                "桃花阵" : "往南就是了。",
                "披星戴月" : (: ask_skill1 :),
                "狂风绝技" : (: ask_skill2 :),
        ]));
        setup();
        carry_object("/clone/misc/cloth")->wear();
        carry_object("/clone/weapon/changjian");
}

void attempt_apprentice(object ob)
{
        string master;
        if (! permit_recruit(ob))
                return;
        
        if (stringp(master = ob->query_temp("taohua/master")))
        {
                if (master != name())
                {
                        command("say 家师不是让你拜" + master + "的吗？你怎么来"
                                "找我来了？");
                        return;
                }

                command("say 好吧，既然家师有令，我就收下你了，不过要好好遵守桃"
                        "花岛的规矩。");
                command("recruit " + ob->query("id"));
                ob->delete_temp("taohua/master");
                return;
        }

        command("shake");
        command("say 我可不敢擅自收徒，你还是找家师黄岛主吧！");
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/pikong-zhang/dai"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，问这个干嘛？";

        if (me->query_skill("pikong-zhang", 1) < 1)
                return "你连劈空掌都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 80)
                return "师父吩咐过，不传功给无功劳的弟子。";

        if (me->query_skill("force") < 120)
                return "你的内功修为不够，还是多锻炼锻炼吧。";

        if (me->query_skill("pikong-zhang", 1) < 80)
                return "你的劈空掌还不够熟练，练高了再来找我。";

        message_sort(HIY "\n$n" HIY "对着$N" HIY "点了点头，说道：“我给你演示"
                     "一遍，可看仔细了！”话音刚落，顿时只见$n" HIY "双掌交叠云"
                     "贯而出，激荡出无数圈劲气，一环环向$N" HIY "斫去，招数当真"
                     "精奇无比。\n\n" NOR, me, this_object());

        command("smile");
        command("say 招式便是如此，你自己下去体会吧。");
        tell_object(me, HIC "你学会了「披星戴月」。\n" NOR);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("pikong-zhang"))
                me->improve_skill("pikong-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/pikong-zhang/dai", 1);
        me->add("gongxian", -80);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/xuanfeng-tui/kuang"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，问这个干嘛？";

        if (me->query_skill("xuanfeng-tui", 1) < 1)
                return "你连旋风扫叶腿都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 300)
                return "师父吩咐过，不传功给无功劳的弟子。";

        if (me->query_skill("force") < 150)
                return "你的内功修为不够，还是多锻炼锻炼吧。";

        if (me->query_skill("xuanfeng-tui", 1) < 100)
                return "你的旋风扫叶腿还不够熟练，练高了再来。";

        if (me->query_skill("pikong-zhang", 1) < 100)
                return "你的劈空掌还不够熟练，练高了再来找我。";

        message_sort(HIY "\n$n" HIY "点了点头，喝道：“看好了！”便在$n" HIY
                     "话音落下的一瞬间，早已拔地而起，陡然使出旋风扫叶腿狂风"
                     "绝技，身法变得飘忽不定，足带风尘，掌携万钧。招式连贯气"
                     "势恢弘，劲风只袭得$N" HIY "面庞隐隐生疼。\n\n" NOR, me,
                     this_object());

        command("haha");
        command("say 下去后可要勤加练习，莫辜负了恩师的一番栽培。");
        tell_object(me, HIC "你学会了「狂风绝技」。\n" NOR);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("xuanfeng-tui"))
                me->improve_skill("xuanfeng-tui", 1500000);
        if (me->can_improve_skill("pikong-zhang"))
                me->improve_skill("pikong-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xuanfeng-tui/kuang", 1);
        me->add("gongxian", -300);

        return 1;
}
