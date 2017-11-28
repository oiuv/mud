#include <ansi.h>

inherit NPC;
void create()
{
        set_name("樵夫", ({ "qiaofu" }) );
        set("gender", "男性" );
        set("age", 30);
        set("per", 30);
        set("long", "一位面色黑红，悠然自得的樵夫．\n");
        set("combat_exp", 10000);
        set("attitude", "friendly");
        set_skill("dodge", 60);
        set_skill("unarmed", 60);
        set_skill("parry", 60);

        set("chat_chance",10);
        set("chat_msg",({
                "只听樵夫唱道：云际依依认旧林，断崖荒草路难寻。\n",
                "樵夫唱道：西山望见朝来雨，南涧归时渡处深。\n",
                "樵夫唱道：观棋柯烂，伐木丁丁，云边谷口徐行，卖薪沽酒，狂笑自陶情。\n",
                "樵夫低声唱道：相逢处，非仙即道，静坐讲黄庭。\n",
        (:random_move:)
        }));

        setup();
        add_money("coin", 50);
        set("inquiry", ([
                "name": "大家都叫我阿牛．平常上山打柴，有时也采些药材。\n",
                "here": "此乃卧龙岗．听说山上有位卧龙先生。\n",
        ]) );
        carry_object("/d/city/obj/cloth")->wear();
}
