#include <ansi.h>
#include "wudu.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("潘秀达", ({ "pan xiuda", "pan" }));
        set("nickname", HIY "笑面阎罗" NOR);
        set("long", @LONG
他就是五毒教的左护法，人称笑面阎罗的潘秀
达。别看他一脸笑眯眯的，但是常常杀人于弹
指之间。
LONG);
        set("title","五毒教护法");
        set("gender", "男性");
        set("age", 38);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        set("max_qi", 2500);
        set("max_jing", 2000);
        set("neili", 3000);
        set("max_neili", 3000);
        set("jiali", 100);
        set("combat_exp", 500000);
        set("score", 50000);

        set("gender", "男性");
        set("age", 38);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 20);
        set("int", 40);
        set("con", 30);
        set("dex", 30);
        set("max_qi", 3000);
        set("max_jing", 3000);
        set("neili", 3000);
        set("max_neili", 3000);
        set("jiali", 100);
        set("combat_exp", 500000);
        set("score", 5000);

        set_skill("force", 120);
        set_skill("wudu-xinfa", 120);
        set_skill("dodge", 110);
        set_skill("jinshe-youshenbu", 110);
        set_skill("strike", 110);
        set_skill("tianchan-zhang", 110);
        set_skill("claw", 110);
        set_skill("wusheng-zhao", 110);
        set_skill("parry", 120);
        set_skill("sword", 120);
        set_skill("jinwu-goufa", 120);
        set_skill("literate", 60);
        set_skill("poison", 120);
        set_skill("wudu-qishu", 120);
        set_skill("martial-cognize", 100);

        map_skill("force", "wudu-xinfa");
        map_skill("dodge", "jinshe-youshenbu");
        map_skill("strike", "tianchan-zhang");
        map_skill("claw", "wusheng-zhao");
        map_skill("parry", "jinwu-goufa");
        map_skill("sword", "jinwu-goufan");
        map_skill("poison", "wudu-qishu");

        prepare_skill("strike", "tianchan-zhang");
        prepare_skill("claw", "wusheng-zhao");

        create_family("五毒教", 12, "护法");

        setup();

        carry_object("/d/wudu/npc/obj/ganggou")->wield();
        carry_object("/d/city/obj/cloth")->wear();

        add_money("silver", 20);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > -5000)
        {
                command("say 做我五毒教弟子必须心狠手辣。");
                return;
        }
        if ((int)ob->query_skill("wudu-xinfa", 1) < 40)
        {
                command("say 你的五毒心法还学的不够啊。");
                return;
        }
        if ((int)ob->query_skill("wudu-qishu", 1) < 30)
        {
                command("say 我五毒教弟子以毒杀人，修习毒技是首要的。");
                command("say 你是否还应该多多钻研本门的绝学？");
                return;
        }

        command("smile");
        command("say 不错，不错。");
        command("recruit " + ob->query("id"));
        return;
}
