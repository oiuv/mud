#include <ansi.h>
#include "taohua.h"

inherit NPC;
inherit F_MASTER;

mixed ask_book1();
mixed ask_book2();
mixed ask_skill1();

#define HETU    "/clone/lonely/book/hetu"
#define LUOSHU  "/clone/lonely/book/luoshu"

void create()
{
        set_name("曲灵风", ({ "qu lingfeng", "qu", "lingfeng" }));
        set("gender", "男性");
        set("age", 46);
        set("long", "曲灵风是黄药师的大徒弟，也是黄药师最得意的徒儿。他\n"
                    "对黄药师一贯忠心耿耿，尤其是性格古怪，象极了他师父\n"
                    "的邪气。他身形修长，相貌英俊，白衣飘飘，形容潇洒。\n");
        set("attitude", "friendly");
        set("class", "scholar");
        set("str", 30);
        set("int", 24);
        set("con", 27);
        set("dex", 23);
        set("shen_type",1);
        set("max_qi", 4500);
        set("max_jing", 2500);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 120);
        set("combat_exp", 1000000);

        set_skill("force", 200);
        set_skill("luoying-xinfa", 200);
        set_skill("unarmed", 180);
        set_skill("xuanfeng-tui", 180);
        set_skill("strike", 180);
        set_skill("pikong-zhang", 180);
        set_skill("finger", 200);
        set_skill("canglang-zhi", 200);
        set_skill("dodge", 200);
        set_skill("parry", 200);
        set_skill("sword", 200);
        set_skill("luoying-shenjian", 200);
        set_skill("literate", 200);
        set_skill("martial-cognize", 180);

        map_skill("force", "luoying-xinfa");
        map_skill("unarmed", "xuanfeng-tui");
        map_skill("strike", "pikong-zhang");
        map_skill("finger", "canglang-zhi");
        map_skill("dodge", "xuanfeng-tui");
        map_skill("parry", "luoying-shenjian");
        map_skill("sword", "luoying-shenjian");

        prepare_skill("finger", "canglang-zhi");

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
                "东邪"     : "家师人称东邪！呵呵。",
                "西毒"     : "欧阳锋是与家师并世齐名的高手，人称老毒物。",
                "南帝"     : "听家师说段王爷现在出家当了和尚，法名一灯。",
                "北丐"     : "北丐洪七公是丐帮帮主，现在扬州城外。",
                "黄蓉"     : "她是师父的爱女。",
                "黄药师"   : "你要拜访家师？",
                "桃花岛"   : "这儿就是桃花岛，你若不是本派弟子，要过桃花阵。",
                "桃花阵"   : "往南就是了。",
                "随波逐流" : (: ask_skill1 :),
                "河图"     : (: ask_book1 :),
                "洛书"     : (: ask_book2 :),
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

        if (me->query("can_perform/luoying-shenjian/sui"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你不是我们桃花岛的人，问这个干嘛？";

        if (me->query_skill("luoying-shenjian", 1) < 1)
                return "你连落英神剑都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 120)
                return "师父吩咐过，不传功给无功劳的弟子。";

        if (me->query_skill("force") < 120)
                return "你的内功修为不够，还是多锻炼锻炼吧。";

        if (me->query_skill("luoying-shenjian", 1) < 80)
                return "你的落英神剑还不够熟练，练高了再来找我。";

        message_sort(HIY "\n$n" HIY "看了看$N" HIY "，没说什么，随手从怀中轻轻取"
                     "出了一本剑谱，指着其中一段对$N" HIY "细说良久，$N" HIY "一"
                     "边听一边不住地点头。\n\n" NOR, me, this_object());

        command("nod");
        command("say 这招并不复杂，你自己下去练吧。");
        tell_object(me, HIC "你学会了「随波逐流」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("luoying-shenjian"))
                me->improve_skill("luoying-shenjian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/luoying-shenjian/sui", 1);
        me->add("gongxian", -120);

        return 1;
}

mixed ask_book1()
{
        object ob, owner, me = this_player();

        if (! me->query_temp("taohua/countbook"))
                return "对不起，没师父的允许，书籍恕不外借。";

        ob = find_object(HETU);

        if (! ob) ob = load_object(HETU);
        owner = environment(ob);

        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "嗯？那本「河图」不就是你拿着在看么？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，我师父已将「河图」借给别人了。";

                if (owner->query("family/family_name") == "桃花岛")
                        return "那本「河图」现在在我师兄" + owner->query("name") +
                               "手中，你要看就去找他吧。";
                else
                        return "那本「河图」现在已落到了" + owner->query("name") +
                               "手中，你去找他吧！";
        }
        ob->move(this_object());

        message_vision(CYN "$N" CYN "叹道：既然是师父的命令，这本「河图」就"
                       "交给你吧。\n" NOR, this_object(), me);
        command("give he tu to " + me->query("id"));
        return 1;
}

mixed ask_book2()
{
        object ob, owner, me = this_player();

        if (! me->query_temp("taohua/countbook"))
                return "对不起，没师父的允许，书籍恕不外借。";

        ob = find_object(LUOSHU);

        if (! ob) ob = load_object(LUOSHU);
        owner = environment(ob);

        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "嗯？那本「洛书」不就是你拿着在看么？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，我师父已将「洛书」借给别人了。";

                if (owner->query("family/family_name") == "桃花岛")
                        return "那本「洛书」现在在我师兄" + owner->query("name") +
                               "手中，你要看就去找他吧。";
                else
                        return "那本「洛书」现在已落到了" + owner->query("name") +
                               "手中，你去找他吧！";
        }
        ob->move(this_object());

        message_vision(CYN "$N" CYN "叹道：既然是师父的命令，这本「洛书」就"
                       "交给你吧。\n" NOR, this_object(), me);
        command("give luo shu to " + me->query("id"));
        return 1;
}

int accept_fight(object ob)
{
        command("wield jian");
}
