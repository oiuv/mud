#include <ansi.h>

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();
mixed ask_skill2();

void create()
{
        set_name("阿大", ({ "a da", "a", "da" }));
        set("long", @LONG
八臂神剑方东白本是丐帮四大长老之首，剑术
之精，名动江湖，只因他出剑奇快，有如生了
七八条手臂一般，因此上得了这个外号。十多
年前听说他身染重病身亡，当时人人都感惋惜，
不觉他竟尚在人世。
LONG);
        set("title", "丐帮四大长老之首");
        set("nickname", WHT "八臂神剑" NOR);
        set("gender", "男性");
        set("age", 68);
        set("attitude", "peaceful");
        set("class", "beggar");

        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);        
        set("max_qi", 5800);
        set("max_jing", 5800);
        set("neili", 6200);
        set("max_neili", 6200);
        set("jiali", 250);
        set("combat_exp", 3500000);
        set("score", 500000);
        set("shen_type", -1);

        set_skill("force", 300);
        set_skill("jiaohua-neigong", 280);
        set_skill("huntian-qigong", 300);
        set_skill("dodge", 280);
        set_skill("feiyan-zoubi", 280);
        set_skill("sword", 300);
        set_skill("guanri-jian", 300);
        set_skill("pichen-jian", 300);
        set_skill("parry", 280);
        set_skill("unarmed", 280);
        set_skill("changquan", 280);
        set_skill("staff", 280);
        set_skill("jiaohua-bangfa", 280);
        set_skill("dagou-bang", 280);
        set_skill("strike", 280);
        set_skill("xianglong-zhang", 280);
        set_skill("begging", 200);
        set_skill("checking", 200);
        set_skill("martial-cognize", 300);

        map_skill("force", "huntian-qigong");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("sword", "guanri-jian");
        map_skill("parry", "guanri-jian");
        map_skill("unarmed", "changquan");
        map_skill("staff", "dagou-bang");
        map_skill("strike", "xianglong-zhang");

        prepare_skill("strike", "xianglong-zhang");

        set("inquiry", ([
                "傲尘剑" : (: ask_skill1 :),
                "焚阳剑" : (: ask_skill2 :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.fen" :),
                (: perform_action, "sword.guan" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        create_family("丐帮", 17, "长老");

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();
        carry_object("/b/yitian/npc/obj/jian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        command("hmm");
        command("say 走开，我不收徒。");
}

int accept_fight(object ob)
{
        command("sneer");
        command("say 滚开。");
        return 0;
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "丐帮")
        {
                command("hmm");
                command("say 滚开。");
                return -1;
        }

        if (ob->query("family/master_id") != "ma dayuan"
           && ob->query("family/master_id") != "hong qigong"
           && ob->query("family/beggarlvl") < 7)
        {
                command("sneer");
                command("say 你还不配。\n");
                return -1; 
        }

        if (skill != "sword"
           && skill != "guanri-jian"
           && skill != "pichen-jian")
        {
                command("hmm");
                command("say 我只会两手剑法，不想学就滚吧。");
                return -1;
        }

        if (skill == "sword" && ob->query_skill("sword", 1) > 179)
        {
                command("say 够了，剩下的自己去练。");
                return -1;
        }

        if (! ob->query_temp("can_learn/ada"))
        {
                command("sigh");
                command("say 也罢，也罢。");
                command("say 这辟尘和观日两套剑法乃我生平绝学，就传给你好了。");
                ob->set_temp("can_learn/ada", 1);
        }
        return 1;
}

mixed ask_skill1()
{
        object me;
        me = this_player();

        if (me->query("can_perform/pichen-jian/ao"))
                return "自己去领悟吧，好自为之。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我滚开。";

        if (me->query("family/master_id") != "ma dayuan"
           && me->query("family/master_id") != "hong qigong"
           && me->query("family/beggarlvl") < 7)
                return "我什么时候说过要教你？";

        if (me->query_skill("pichen-jian", 1) < 1)
                return "你学过辟尘剑法吗？不学哪来绝招。";

        if (me->query("gongxian") < 300)
                return "你在帮内毫无作为可言，这样的人不值得我怜悯。";

        if (me->query_skill("pichen-jian", 1) < 100)
                return "你的辟尘剑法还不到家，要多练练。";

        message_sort(HIY "\n$n" HIY "一声长叹，摇头道：“也罢，也"
                     "罢，你过来。”说完便将$N" HIY "招到一旁的僻"
                     "静处，轻声在$N" HIY "耳边低声嘀咕了半天，不"
                     "时还伸指捏作剑诀，比划演示剑招，所示全为辟尘"
                     "剑法绝招的精微要诣，$N" HIY "听后大有所悟。"
                     "\n\n" NOR, me, this_object());

        command("sigh");
        command("say 你好好努力吧，别像我……唉。");
        tell_object(me, HIC "你学会了「傲尘剑」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("pichen-jian"))
                me->improve_skill("pichen-jian", 1500000);

        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/pichen-jian/ao", 1);
        me->add("gongxian", -300);
        return 1;
}

mixed ask_skill2()
{
        object me;
        me = this_player();

        if (me->query("can_perform/guanri-jian/fen"))
                return "自己去领悟吧，好自为之。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我滚开。";

        if (me->query("family/master_id") != "ma dayuan"
           && me->query("family/master_id") != "hong qigong"
           && me->query("family/beggarlvl") < 7)
                return "我什么时候说过要教你？";

        if (me->query_skill("guanri-jian", 1) < 1)
                return "你学过观日剑法吗？不学哪来绝招。";

        if (me->query("gongxian") < 1200)
                return "你在帮内毫无作为可言，这样的人不值得我怜悯。";

        if (me->query_skill("guanri-jian", 1) < 150)
                return "你的观日剑法还不到家，要多练练。";

        if ((int)me->query("max_neili") < 2000)
                return "你内力修为不够，学不了这一招。";

        message_sort(HIY "\n$n" HIY "一声长叹，摇头道：“也罢，也"
                     "罢，你过来。”说完便将$N" HIY "招到一旁的僻"
                     "静处，轻声在$N" HIY "耳边低声嘀咕了半天，不"
                     "时还伸指捏作剑诀，比划演示剑招，所示全为辟尘"
                     "剑法绝招的精微要诣，$N" HIY "听后大有所悟。"
                     "\n\n" NOR, me, this_object());

        command("sigh");
        command("say 你好好努力吧，别像我……唉。");
        tell_object(me, HIC "你学会了「焚阳剑」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("guanri-jian"))
                me->improve_skill("guanri-jian", 1500000);

        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/guanri-jian/fen", 1);
        me->add("gongxian", -1200);
        return 1;
}
