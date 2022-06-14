// iqa - 智能应答机器人
inherit CORE_DIR "system/daemons/http/iqa_d";

int main(object me, string arg)
{
    iqa(me, arg);
    return 1;
}
