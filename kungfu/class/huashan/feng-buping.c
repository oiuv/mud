// feng-buping.c  封不平

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

#include <ansi.h>

void create()
{
        set_name("封不平", ({ "feng buping", "feng" }) );
        set("gender", "男性");
        set("class", "swordsman");
        set("title", "华山剑宗第十三代弟子");
        set("age", 45);
        set("long", "封不平是华山剑宗第一高手，满脸戾气一张黄焦焦的面皮。\n");
        set("attitude", "peaceful");
        set("str", 28);
        set("int", 32);
        set("con", 31);
        set("dex", 29);

        set("max_qi", 6300);
        set("max_jing", 2400);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jiali", 100);

        set("combat_exp", 3000000);
        set("shen_type", -1);

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.long" :),
                (: perform_action, "sword.xian" :),
                (: perform_action, "strike.piao" :),
                (: perform_action, "cuff.song" :),
                (: exert_function, "recover" :),
        }) );

        set_skill("unarmed", 240);
        set_skill("cuff", 240);
        set_skill("strike", 240);
        set_skill("huashan-zhang", 240);
        set_skill("sword", 280);
        set_skill("force", 200);
        set_skill("parry", 280);
        set_skill("dodge", 240);
        set_skill("literate", 150);
        set_skill("huashan-jian", 280);
        set_skill("huashan-xinfa", 200);
        set_skill("huashan-quan", 200);
        set_skill("huashan-shenfa", 240);

        map_skill("sword", "huashan-jian");
        map_skill("parry", "huashan-jian");
        map_skill("force", "huashan-xinfa");
        map_skill("cuff", "huashan-quan");
        map_skill("dodge", "huashan-shenfa");

        prepare_skill("strike", "hunyuan-zhang");
        prepare_skill("cuff", "poyu-quan");

        set("inquiry", ([
                "绝招"     : "我剑宗剑法精奇，你想学哪门绝招？\n",
                "绝技"     : "我剑宗剑法精奇，你想学哪门绝招？\n",
                "剑宗"     : "我就是剑宗传人！\n",
                "狂风快剑" : "你想学的话还是找我成师弟吧！\n",
        ]));

        set_temp("apply/attack", 220);
        set_temp("apply/defense", 220);
        set_temp("apply/damage", 200);
        set_temp("apply/unarmed_damage", 200);

        create_family("华山派", 13, "弟子");

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

int accept_ask(object me, string topic)
{
        if (me->query("family/family_name") != "华山派")
                return 0;

        switch (topic)
        {
        case "风起云涌" :
                if (me->query("max_neili") > 2000 || me->query_skill("force") > 205)
                {
                      command("shake");
                      command("say 我剑宗以剑术为主，气为次！你的内功修为已入了气宗歧途，再不能修炼剑宗剑术。");
                      return 1;
                }
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/kuangfeng-jian/yong",
                           "name"    : "风起云涌 ",
                           "sk1"     : "kuangfeng-jian",
                           "lv1"     : 140,
                           "sk2"     : "dodge",
                           "lv2"     : 140, ]));
                break;

        case "夺命连环三仙剑" :
                if (me->query("max_neili") > 2000 || me->query_skill("force") > 205)
                {
                      command("shake");
                      command("say 我剑宗以剑术为主，气为次！你的内功修为已入了气宗歧途，再不能修炼剑宗剑术。");
                      return 1;
                }
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/huashan-jian/xian",
                           "name"    : "夺命连环三仙剑",
                           "sk1"     : "huashan-jian",
                           "lv1"     : 160,
                           "sk2"     : "dodge",
                           "lv2"     : 160, ]));
                break;

        default:
                return 0;
        }
}

void attempt_apprentice(object ob)
{
        command("say 我从不收徒弟！");
        return;
}
