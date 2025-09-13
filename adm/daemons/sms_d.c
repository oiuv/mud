// SMS 短信接口

inherit CORE_DIR "system/daemons/http/sms_d";

// 重写接口
void sms(object me, mixed code, mixed mobile)
{
    tell_object(me, "【提示】短信服务关闭，暂不支持收发手机短信，请直接用验证码[" + code + "]绑定手机。\n");
}
