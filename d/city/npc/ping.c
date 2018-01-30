#include <ansi.h>
#include <medical.h>

inherit NPC;
inherit F_DEALER;

string ask_job();
int do_peiyao(string arg);
int working(object me);
int halt_working(object me);

void create()
{
        set_name("ƽһָ", ({ "ping yizhi", "ping", "yizhi" }));
        set("title", "�������ǰ��");
        set("nickname", HIW "ɱ����ҽ" NOR);
        set("gender", "����");
        set("long", "������ҽ���߳��ġ�ɱ����ҽ��ƽһָ���������Ը��\n"
                    "�֣�����ʲô�˶�ҽ�ġ�\n");
        set("age", 65);

        set("int", 38);
        
        set("qi", 1000);
        set("max_qi", 1000);
        set("jing", 1000);
        set("max_jing", 1000);
        set("shen_type", 1);

        set("combat_exp", 500000);
        set("attitude", "heroism");

        set_skill("unarmed", 80);
        set_skill("dodge", 80);
        set_skill("parry", 60);
        set_temp("apply/attack", 70);
        set_temp("apply/defense", 70);
        set_temp("apply/damage", 50);
        set("inquiry", ([
                "��ҩ"   : (: ask_job :),
                "����"   : (: ask_job :),
                "job"    : (: ask_job :),
        ]));

        set("vendor_goods", ({
                HERB("chaihu"),         // ���
                HERB("chenpi"),         // ��Ƥ
                HERB("chongcao"),       // ���
                HERB("chuanwu"),        // ����
                HERB("dahuang"),        // ���
                HERB("dangui"),         // ����
                HERB("duhuo"),          // ����
                HERB("fangfeng"),       // ����
                HERB("fuzi"),           // ����
                HERB("gsliu"),          // ��ʯ��
                HERB("guiwei"),         // ��β
                HERB("hafen"),          // ���
                HERB("heshouwu"),       // ������
                HERB("honghua"),        // �컨
                HERB("hugu"),           // ����
                HERB("huangqi"),        // ����
                HERB("juhua"),          // �ջ�
                HERB("lanhua"),         // ����
                HERB("lingxian"),       // ����
                HERB("lingzhi"),        // ��֥
                HERB("lurong"),         // ¹��
                HERB("mahuang"),        // ���
                HERB("moyao"),          // ûҩ
                HERB("niuhuang"),       // ţ��
                HERB("niuxi"),          // ţϥ
                HERB("qianjinzi"),      // ǧ����
                HERB("renshen"),        // �˲�
                HERB("ruxiang"),        // ����
                HERB("shadan"),         // �赨
                HERB("shancha"),        // ɽ�軨
                HERB("shanjia"),        // ɽ��
                HERB("shengdi"),        // ����
                HERB("shenglg"),        // ������
                HERB("sumu"),           // ��ľ
                HERB("taoxian"),        // ����
                HERB("tenghuang"),      // �ٻ�
                HERB("tianqi"),         // ����
                HERB("tugou"),          // ����
                HERB("wulingzhi"),      // ����֬
                HERB("xiefen"),         // Ы��
                HERB("xijiao"),         // Ϭ��
                HERB("xiongdan"),       // �ܵ�
                HERB("xionghuang"),     // �ۻ�
                HERB("xuejie"),         // Ѫ��
                HERB("xuelian"),        // ѩ��
                HERB("yanwo"),          // ����
                HERB("yjhua"),          // ���
                HERB("yuanzhi"),        // Զ־
                HERB("zihua"),          // �ϻ�
                HERB("zzfen"),          // �����

                "/clone/misc/yanbo",    // �в�
                "/d/shenlong/obj/hua4", // �����
        }));

        setup();
        add_money("gold", 1);
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        add_action("do_peiyao", "peiyao");
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}

string ask_job()
{
        object me;
//      object *obs;

        me = this_player();
        if (me->query_temp("job/peiyao"))
                return "����ɵĻ��������ô��";

        if (me->query("combat_exp") > 20000)
                return "�������Ҳ̫�������˰ɡ�";

        if (me->query("combat_exp") < 5000)
                return "��ƾ�������������ҿ�����ҩ�ʶ��˲�������";

        if (me->query("qi") < 5)
                return "�㻹����ЪЪ�ɣ���һ�۳��������ҿɸ�������";

        if (! interactive(me))
                return "����";
/*
//ȡ����������
        obs = filter_array(all_inventory(environment()),
                           (: interactive($1) &&
                              $1 != $(me) &&
                              $1->query_temp("job/peiyao") &&
                              query_ip_number($1) == query_ip_number($(me)) :));
        if (sizeof(obs) > 0)
                return "�����Ѿ���" + obs[0]->name() + "�ڸɻ��ˣ���ȵȰɡ�";
*/
        me->set_temp("job/peiyao", 1);
        return "�ã���Ͱ�����ҩ(peiyao)�ɣ��������⼸ζ��";
}

int do_peiyao(string arg)
{
        object me;

        me = this_player();
        if (me->is_busy())
                return notify_fail("����æ���أ����ż���\n");

        if (! me->query_temp("job/peiyao"))
        {
                message_vision(CYN "$N" CYN "����ץ��ζҩ���ƣ�������$n"
                               CYN "ŭ�ȵ������ҷ��£����Ҷ���\n" NOR,
                               me, this_object());
                return 1;
        }

        me->set_temp("job/step", 1);
        me->start_busy(bind((: call_other, __FILE__, "working" :), me),
                       bind((: call_other, __FILE__, "halt_working" :), me));
        tell_object(me, HIY "�㿪ʼ������\n" NOR);
        return 1;
}

int working(object me)
{
        object ob;
        string msg;
        int finish;
        int b;

        if (! me->query_temp("job/step"))
                me->set_temp("job/step", 1);

        if (! living(me))
        {
                me->delete_temp("job/peiyao");
                me->delete_temp("job/step");
                return 0;
        }

        finish = 0;
        me->receive_damage("qi", 1);
        switch (me->query_temp("job/step"))
        {
        case 1:
                msg = "$N��������ѡ����һЩҩ�ġ�";
                break;
        case 2:
                msg = "$N��ҩ�ķŽ�ҩ�ʣ�ʹ������������";
                break;
        case 3:
                msg = "ҩ�Ľ���������м������һ��";
                break;
        case 4:
                msg = "��м��$N�ĵ�Ū��Խ��Խϸ���𽥱���˷�ĩ��";
                break;
        default:
                msg = "$N��ҩ�İ��ã��ݸ�$n��";
                finish = 1;
                break;
        }
        msg += "\n";

        if (finish)
        {
                msg += CYN "$n" CYN "����$N" CYN "���ҩ����ͷ������������"
                       "���Ǹ���ı��꣡\n" NOR;

                me->delete_temp("job/peiyao");
                me->delete_temp("job/step");
				// ��������5+5��
                b = 30 + random(20);
                me->add("combat_exp", b);
                me->improve_potential(b);

                ob = new("/clone/money/coin");
                ob->set_amount(20);
                ob->move(me, 1);
        }

        msg = replace_string(msg, "$N", "��");
        msg = replace_string(msg, "$n", name());
        tell_object(me, msg);

        if (finish)
        {
                if (b > 0)
                {
                        tell_object(me, HIC "\n������" + chinese_number(b) +
                                        "�㾭���Ǳ�ܡ�\n\n" NOR);
                }

                if (random(200) == 1)		//��������5����2015��4��5�գ�
                {
                        msg = HIW "\n$n" HIW "��$N" HIW "�ٺ�һЦ�������ɵò�"
                              "�����е���˼���������ĥ���������͸���������"
                              "��\n" NOR;

                        message_vision(msg, me, this_object());
                        ob = new("/clone/misc/dymo");
                        ob->move(me, 1);
                        tell_object(me, HIC "\n������һ��" + ob->name() +
                                        HIC "��\n" NOR);
                }

                return 0;
        }

        me->add_temp("job/step", 1);
        return 1;
}

int halt_working(object me)
{
        message_vision(HIY "$N" HIY "�����еĻ�һ˦�����µ��������ˣ������ˣ�\n"
                       NOR, me);
        me->delete_temp("job/peiyao");
        me->delete_temp("job/step");
        return 1;
}