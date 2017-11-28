#include <ansi.h>
#include "gaibang.h"

#define POBU    "/d/gaibang/npc/obj/po-bu"
#define LING    "/d/gaibang/npc/obj/qingzhu-ling"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;
inherit F_COAGENT;

mixed ask_me();

void create()
{
        set_name("简长老", ({ "jian zhanglao", "jian", "zhanglao" }));
        set("long", @LONG
简长老是丐邦的执法长老，代帮主执掌法刀以
及青竹令等。他向来嫉恶如仇，弟子中有谁犯
过，出手决不容情。
LONG);
        set("nickname", HIR "执法长老" NOR);
        set("title", "丐帮九袋长老");
        set("gender", "男性");
        set("age", 50);
        set("attitude", "peaceful");
        
        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);
        set("max_qi", 4200);
        set("max_jing", 3500);
        set("neili", 4500);
        set("max_neili", 4500);
        set("jiali", 180);
        set("combat_exp", 2000000);
        set("score", 500000);
        set("shen_type", 1);

        set_skill("force", 240);
        set_skill("jiaohua-neigong", 220);
        set_skill("huntian-qigong", 240);
        set_skill("dodge", 220);
        set_skill("feiyan-zoubi", 220);
        set_skill("unarmed", 220);
        set_skill("changquan", 220);
        set_skill("jueming-tui", 220);
        set_skill("strike", 220);
        set_skill("tongchui-zhang", 220);
        set_skill("parry", 220);
        set_skill("staff", 240);
        set_skill("jiaohua-bangfa", 220);
        set_skill("fumo-zhang", 220);
        set_skill("begging", 260);
        set_skill("checking", 260);
        set_skill("literate", 200);
        set_skill("martial-cognize", 200);

        map_skill("force", "huntian-qigong");
        map_skill("unarmed", "jueming-tui");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("parry", "fumo-zhang");
        map_skill("staff", "fumo-zhang");
        map_skill("strike", "tongchui-zhang");

        prepare_skill("strike", "tongchui-zhang");
        prepare_skill("unarmed", "jueming-tui");

        create_family("丐帮", 18, "九袋长老");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "strike.kai" :),
                (: perform_action, "unarmed.jue" :),
                (: perform_action, "staff.lun" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        set("inquiry", ([
                "青竹令" : (: ask_me :)
        ]));

        setup();
        carry_object("/clone/weapon/gangzhang")->wield();
        carry_object("/d/gaibang/npc/obj/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        command("hmm");
        command("say 老夫不收徒弟，你还是请回吧。");
}

mixed ask_me()
{
        object ob, me;
        int lvl, gx;

        me = this_player();

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与本帮素无来往，不知此话从何谈起？";

        if (me->query("combat_exp", 1) < 10000)
                return "嘿嘿，你就这点本事也好意思来要青竹令？";

        lvl = me->query("family/beggarlvl");

        if (lvl >= 9)
                return "你已经是本帮长老了，又何去跟后辈们计较。";

        if (lvl <= 0)
                gx = 100;
        else
                gx = lvl * 100 + 200;

        if (me->query("gongxian") < gx)
                return "你为本帮效力不够，暂时不能给你升袋。";

        if (present("qingzhu ling", me))
                return "你身上不是已经有青竹令了吗？";

        if (time() - me->query_temp("have_ling") < 100)
                return "我不是刚刚才给了你一面吗？稍微等会吧。";

        ob = new(LING);
        ob->move(this_object());

        command("give qingzhu ling to " + me->query("id"));
        me->set_temp("have_ling", time());

        return "凭这面青竹令，你可自由向你的同门大师兄挑战。";
}

int accept_object(object ob, object obj)
{
        object me = this_object();
        int r;
        int lvl, exp, pot, sc, ww, gx;
        string msg;

        if (r = ::accept_object(ob, obj))
                return r;

        if (base_name(obj) != POBU)
        {
                command("say 你给我这种东西干什么？");
                return 0;
        }

        if (obj->query("owner") != ob->name())
        {
                command("say 你这快破布是从哪里偷来的？");
                return 0;
        }

        if (ob->query_temp("have_cloth") < 1)
        {
                command("say 你真的挑胜了么？我怎么就没听说？");
                return 0;
        }

        lvl = ob->query("family/beggarlvl");

        if (lvl >= 9)
        {
                command("say 你已经是本帮长老了，还想当帮主？");
                return 0;
        }

        if (lvl <= 0)
                gx = 100;
        else
                gx = lvl * 100 + 200;

        if (ob->query("gongxian") < gx)
        {
                command("say 这个…你为本帮效力不够，暂时不能给你升袋。");
                return 0;
        }

        ob->add("family/beggarlvl", 1);
        ob->set("title", ob->query_temp("newtitle"));
        ob->delete_temp("have_cloth");
        ob->delete_temp("newtitle");

        message_vision(HIY "\n$N" HIY "接过了破布，然后将其钉"
                       "在$n" HIY "的破衣服上，俨然一个新口袋"
                       "。\n\n" NOR, me, ob);
        command("nod");
        command("say 既然升袋，就当牢记帮规，为民除害！");

        lvl = lvl + 1;
        exp = lvl * 600 + random(lvl * 400);
        pot = lvl * 300 + random(lvl * 200);
        sc = lvl * 80 + random(lvl * 50);
        ww = lvl * 50 + random(lvl * 30);

        ob->add("combat_exp", exp);
        ob->add("potential", pot);
        ob->add("score", sc);
        ob->add("weiwang", ww);
        ob->add("gongxian", -gx);

        msg = HIC "\n通过升袋的经历，你获得了" +
              chinese_number(exp) + "点经验、" +
              chinese_number(pot) + "点潜能、" +
              chinese_number(sc) + "点江湖阅历以及" +
              chinese_number(ww) + "点江湖威望，同时"
              "消耗了" + chinese_number(gx) + "点门"
              "派贡献，武学得到了精进。\n\n" NOR;

        tell_object(ob, sort_string(msg, 54));
        ob->improve_skill("martial-cognize", 1500000);

        destruct(obj);
        return 1;
}

void unconcious()
{
        die();
}
