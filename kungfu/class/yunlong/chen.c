// chen.c 陈近南

#include <ansi.h>

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;

int ask_tuihui();
mixed ask_me();

void create()
{
        set_name("陈近南", ({ "chen jinnan", "chen","jinnan" }));
        set("title", HIR "天地会"HIM"总舵主"NOR );
        set("nickname", HIC "英雄无敌" NOR);
        set("long", 
                "\n这是一个文士打扮的中年书生，神色和蔼。\n"
                "他就是天下闻名的天地会总舵主陈近南，\n"
                "据说十八般武艺，样样精通。\n"
                "偶尔向这边看过来，顿觉他目光如电，英气逼人。\n");
        set("gender", "男性");
        set("class", "scholar");
        set("age", 45);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        
        set("max_qi", 5000);
        set("max_jing", 3000);
        set("neili", 5500);
        set("max_neili", 5500);
        set("jiali", 120);
        set("combat_exp", 2000000);
        set("score", 500000);

        set_skill("literate", 200);
        set_skill("force", 250);
        set_skill("dodge", 250);
        set_skill("unarmed", 250);
        set_skill("parry", 250);
        set_skill("claw", 250);
        set_skill("houquan", 250);
        set_skill("yunlong-xinfa", 250);
        set_skill("yunlong-shengong", 250);
        set_skill("yunlong-shenfa", 250);
        set_skill("ningxue-shenzhao", 250);

        map_skill("dodge", "yunlong-shenfa");
        map_skill("force", "yunlong-shengong");
        map_skill("unarmed", "houquan");
        map_skill("parry", "ningxue-shenzhao");
        map_skill("claw", "ningxue-shenzhao");

        prepare_skill("claw","ningxue-shenzhao");

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: perform_action, "claw.ji" :),
                (: exert_function, "recover" :),
        }) );

        create_family("云龙门", 1, "开山祖师");
        set("book_count", 1);
        set("inquiry", ([
                "天地会" :  "只要是英雄好汉，都可以入我天地会(join tiandihui)。",
                "入会" :  "还不快快如天地会一同反清复明。",
                "绝招" : (: ask_me :),
                "绝技" : (: ask_me :),
                "疾电" : (: ask_me :),
                "凝血神爪" : (: ask_me :),
                "退会" : (: ask_tuihui :),
                "tuihui"   : (: ask_tuihui :),
        ]) );

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();
        carry_object("/clone/cloth/cloth")->wear();
}

void init()
{
        ::init();
        add_action("do_join","join");
}

int ask_tuihui()
{
        object ob;

        ob = this_player();
        if (ob->query("party/party_name") != "天地会")
        {
                message_vision("陈近南笑了笑，对$N说道：你还没"
                               "加入我天地会呢，退什么退？\n", ob);
                return 1;
        }
        command("look "+ob->query("id"));
        command("sigh ");
        command("say 反清复明，就要坚贞志士，你去吧! ");
        ob->delete("party");
        ob->delete("rank");
        ob->delete("level");
        return 1;
}

mixed ask_me()
{
        object me;

        me = this_player();
        if (me->query("can_perform/ningxue-shenzhao/ji"))
                return "你真会开玩笑，会了还来找我。";

        if (! me->query("story/shenzhao"))
                return "你打听这个干嘛？";

        if (me->query("shen") < 1000000)
                return "习武之人最重一个“侠”字，侠义方面你还做得不够！";

        if (me->query_skill("ningxue-shenzhao", 1) < 250)
                return "你的凝血神爪还不到家，要多练练！";

        message_vision(HIY "$n" HIY "点了点头，变掌为爪，"
                       "随意挥洒而出，双爪顿时幻出漫天爪影，"
                       "气势恢弘无比。\n" NOR,
                       me, this_object());
        command("nod");
        command("say 你可明白了？");
        tell_object(me, HIC "你学会了「疾电」这一招。\n" NOR);
        if (me->can_improve_skill("claw"))
                me->improve_skill("claw", 250000);
        me->set("can_perform/ningxue-shenzhao/ji", 1);
        return 1;
}

void unconcious()
{
        die();
}

#include "/kungfu/class/yunlong/tiandihui.h"
